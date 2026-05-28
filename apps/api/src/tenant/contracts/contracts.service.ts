import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContractStatus, PaymentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { StockService } from '../stock/stock.service';
import { CreateContractDto } from './dto/contract.dto';
import { addDays, addWeeks, addMonths } from 'date-fns';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private customersService: CustomersService,
    private stockService: StockService,
  ) {}

  async findAll(
    tenantId: string,
    filters: { saleId?: string; customerId?: string; status?: ContractStatus },
  ) {
    return this.prisma.contract.findMany({
      where: { tenantId, ...filters },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        product: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        sale: { select: { id: true, name: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        product: true,
        branch: { select: { id: true, name: true } },
        sale: { select: { id: true, name: true } },
        payments: { orderBy: { dueDate: 'asc' } },
        lateFees: true,
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async create(tenantId: string, saleId: string, dto: CreateContractDto) {
    // 1. ตรวจ customer ว่า suspend หรือเกิน limit
    await this.customersService.validateCanContract(tenantId, dto.customerId);

    // 2. ดึงราคาสินค้า
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    // 3. ตรวจ stock (เช็คก่อน แต่ยังไม่ลด — ลดตอน approve down payment)
    const stock = await this.prisma.branchStock.findUnique({
      where: {
        branchId_productId: {
          branchId: dto.branchId,
          productId: dto.productId,
        },
      },
    });
    if (!stock || stock.quantity < 1) {
      throw new BadRequestException('Product out of stock');
    }

    // 4. คำนวณ installment schedule
    const { totalAmount, installmentCount, schedule } = this.buildSchedule(
      dto.paymentType,
      product,
    );

    // 5. สร้าง contract + payments ใน transaction
    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          tenantId,
          customerId: dto.customerId,
          productId: dto.productId,
          branchId: dto.branchId,
          saleId,
          paymentType: dto.paymentType,
          totalAmount,
          installmentCount,
          warrantyActive: false,
        },
      });

      // สร้าง Payment งวดแรก = เงินดาวน์ (dueDate = วันนี้)
      const today = new Date();
      await tx.payment.create({
        data: {
          tenantId,
          contractId: contract.id,
          amount: product.downPayment,
          dueDate: today,
          isDownPayment: true,
        },
      });

      // สร้าง Payment งวดถัดไปทั้งหมด
      const paymentData = schedule.map((dueDate) => ({
        tenantId,
        contractId: contract.id,
        amount: Number(this.getInstallmentPrice(dto.paymentType, product)),
        dueDate,
        isDownPayment: false,
      }));
      await tx.payment.createMany({ data: paymentData });

      return tx.contract.findUnique({
        where: { id: contract.id },
        include: { payments: { orderBy: { dueDate: 'asc' } } },
      });
    });
  }

  async cancel(tenantId: string, id: string) {
    const contract = await this.findOne(tenantId, id);

    if (contract.status === ContractStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed contract');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id },
        data: { status: ContractStatus.CANCELLED },
      });

      // คืน stock ถ้าเคยจ่ายดาวน์แล้ว (สินค้าออกไปแล้ว)
      if (contract.downPaymentPaid) {
        await this.stockService.incrementOnCancellation(
          tenantId,
          contract.branchId,
          contract.productId,
          tx,
        );
      }

      return { message: 'Contract cancelled successfully' };
    });
  }

  private buildSchedule(
    paymentType: PaymentType,
    product: {
      dailyPrice: unknown;
      weeklyPrice: unknown;
      monthlyPrice: unknown;
      cashPrice: unknown;
      downPayment: unknown;
    },
  ) {
    const now = new Date();
    const schedule: Date[] = [];

    if (paymentType === PaymentType.CASH) {
      return {
        totalAmount: product.cashPrice as number,
        installmentCount: 1,
        schedule: [],
      };
    }

    // กำหนดจำนวนงวดและ interval
    const configs: Record<
      string,
      { count: number; next: (d: Date, i: number) => Date }
    > = {
      DAILY: { count: 30, next: (d, i) => addDays(d, i + 1) },
      WEEKLY: { count: 12, next: (d, i) => addWeeks(d, i + 1) },
      MONTHLY: { count: 12, next: (d, i) => addMonths(d, i + 1) },
    };

    const config = configs[paymentType];
    for (let i = 0; i < config.count; i++) {
      schedule.push(config.next(now, i));
    }

    const pricePerInstallment = Number(
      this.getInstallmentPrice(paymentType, product),
    );
    const totalAmount =
      Number(product.downPayment) + pricePerInstallment * config.count;

    return { totalAmount, installmentCount: config.count, schedule };
  }

  private getInstallmentPrice(
    paymentType: PaymentType,
    product: Record<string, unknown>,
  ) {
    const map: Partial<Record<PaymentType, unknown>> = {
      [PaymentType.DAILY]: product.dailyPrice,
      [PaymentType.WEEKLY]: product.weeklyPrice,
      [PaymentType.MONTHLY]: product.monthlyPrice,
    };
    return map[paymentType] ?? product.cashPrice;
  }
}
