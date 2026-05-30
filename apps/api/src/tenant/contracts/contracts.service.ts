import { addDays, addWeeks, addMonths } from 'date-fns';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Contract } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';

/**
 * Mirrors Prisma's `PaymentType` enum. Kept as a local string union so the
 * pure scheduling logic has no dependency on the generated Prisma client and
 * stays trivially unit-testable.
 */
export type ScheduleType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CASH';

export interface ScheduleInput {
  paymentType: ScheduleType;
  /** Contract start date — the down payment is due on this date (day 0). */
  startDate: Date;
  downPayment: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  cashPrice: number;
}

/** One row of the generated installment schedule (becomes a `Payment` record). */
export interface ScheduleItem {
  amount: number;
  dueDate: Date;
  isDownPayment: boolean;
}

export interface CreateContractInput {
  tenantId: string;
  customerId: string;
  productId: string;
  branchId: string;
  saleId: string;
  paymentType: ScheduleType;
  /** Defaults to "now" when omitted. */
  startDate?: Date;
}

export interface ContractListItem {
  id: string;
  customerName: string;
  productName: string;
  paymentType: string;
  status: string;
  totalAmount: number;
  outstanding: number;
}

export interface ContractDetailPayment {
  id: string;
  seq: number;
  amount: number;
  dueDate: string;
  isDownPayment: boolean;
  status: string;
  method: string | null;
  paidAt: string | null;
  receiptNumber: string | null;
}

export interface ContractDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  branchName: string;
  saleName: string;
  paymentType: string;
  status: string;
  totalAmount: number;
  outstanding: number;
  installmentCount: number;
  paidCount: number;
  createdAt: string;
  payments: ContractDetailPayment[];
}

/** Contract statuses that count against a customer's contract limit. */
const OPEN_CONTRACT_STATUSES = [
  'PENDING_DOWN_PAYMENT',
  'ACTIVE',
  'DEFAULTED',
] as const;

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a contract together with its full payment schedule in a single
   * transaction. Validates customer eligibility and branch stock first.
   *
   * Stock is NOT decremented here — that happens when the down payment is
   * approved (PRD: goods leave the store only after the down payment).
   */
  async create(input: CreateContractInput): Promise<Contract> {
    const startDate = input.startDate ?? new Date();

    const [product, customer] = await Promise.all([
      this.prisma.product.findFirst({
        where: { id: input.productId, tenantId: input.tenantId },
      }),
      this.prisma.customer.findFirst({
        where: { id: input.customerId, tenantId: input.tenantId },
      }),
    ]);

    if (!product) throw new BadRequestException('ไม่พบสินค้า');
    if (!customer) throw new BadRequestException('ไม่พบลูกค้า');

    const activeContractCount = await this.prisma.contract.count({
      where: {
        customerId: input.customerId,
        status: { in: [...OPEN_CONTRACT_STATUSES] },
      },
    });

    const eligibility = CustomersService.canCreateContract({
      isSuspended: customer.isSuspended,
      activeContractCount,
      contractLimit: customer.contractLimit,
    });
    if (!eligibility.allowed) {
      throw new BadRequestException(
        eligibility.reason === 'SUSPENDED'
          ? 'ลูกค้าถูกระงับการสร้างสัญญา'
          : 'ลูกค้าถึงขีดจำกัดจำนวนสัญญาแล้ว',
      );
    }

    const stock = await this.prisma.branchStock.findUnique({
      where: {
        branchId_productId: {
          branchId: input.branchId,
          productId: input.productId,
        },
      },
    });
    if (!stock || stock.quantity < 1) {
      throw new BadRequestException('สินค้าหมดสต็อกที่สาขานี้');
    }

    const schedule = ContractsService.buildSchedule({
      paymentType: input.paymentType,
      startDate,
      downPayment: Number(product.downPayment),
      dailyPrice: Number(product.dailyPrice),
      weeklyPrice: Number(product.weeklyPrice),
      monthlyPrice: Number(product.monthlyPrice),
      cashPrice: Number(product.cashPrice),
    });

    const totalAmount = schedule.reduce((sum, item) => sum + item.amount, 0);
    const installmentCount =
      input.paymentType === 'CASH'
        ? 1
        : schedule.filter((item) => !item.isDownPayment).length;

    return this.prisma.contract.create({
      data: {
        tenantId: input.tenantId,
        customerId: input.customerId,
        productId: input.productId,
        branchId: input.branchId,
        saleId: input.saleId,
        paymentType: input.paymentType,
        totalAmount,
        installmentCount,
        payments: {
          create: schedule.map((item) => ({
            tenantId: input.tenantId,
            amount: item.amount,
            dueDate: item.dueDate,
            isDownPayment: item.isDownPayment,
          })),
        },
      },
    });
  }

  /**
   * Lists a tenant's contracts shaped for the contracts table UI. Outstanding
   * is the sum of payments not yet approved.
   */
  async list(tenantId: string): Promise<ContractListItem[]> {
    const contracts = await this.prisma.contract.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        product: { select: { name: true } },
        payments: { select: { amount: true, status: true } },
      },
    });

    return contracts.map((contract) => {
      const outstanding = contract.payments
        .filter((p) => p.status !== 'APPROVED')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        id: contract.id,
        customerName: contract.customer.name,
        productName: contract.product.name,
        paymentType: contract.paymentType,
        status: contract.status,
        totalAmount: Number(contract.totalAmount),
        outstanding,
      };
    });
  }

  /**
   * Full contract detail with its payment schedule, for the detail page.
   * Scoped to the tenant; throws 404 if not found in this tenant.
   */
  async getDetail(
    tenantId: string,
    contractId: string,
  ): Promise<ContractDetail> {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, tenantId },
      include: {
        customer: { select: { name: true, phone: true } },
        product: { select: { name: true } },
        branch: { select: { name: true } },
        sale: { select: { name: true } },
        payments: { orderBy: { dueDate: 'asc' } },
      },
    });
    if (!contract) throw new NotFoundException('ไม่พบสัญญา');

    const payments = contract.payments.map((p, index) => ({
      id: p.id,
      seq: p.isDownPayment ? 0 : index,
      amount: Number(p.amount),
      dueDate: p.dueDate.toISOString(),
      isDownPayment: p.isDownPayment,
      status: p.status,
      method: p.method,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      receiptNumber: p.receiptNumber,
    }));

    const paidCount = payments.filter((p) => p.status === 'APPROVED').length;
    const outstanding = payments
      .filter((p) => p.status !== 'APPROVED')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      id: contract.id,
      customerName: contract.customer.name,
      customerPhone: contract.customer.phone,
      productName: contract.product.name,
      branchName: contract.branch.name,
      saleName: contract.sale.name,
      paymentType: contract.paymentType,
      status: contract.status,
      totalAmount: Number(contract.totalAmount),
      outstanding,
      installmentCount: contract.installmentCount,
      paidCount,
      createdAt: contract.createdAt.toISOString(),
      payments,
    };
  }

  /**
   * Builds the full payment schedule for a contract.
   *
   * Per PRD (docs/prd/installment-saas-v1.md):
   *   DAILY   → 1 down payment + 30 × dailyPrice
   *   WEEKLY  → 1 down payment + 12 × weeklyPrice
   *   MONTHLY → 1 down payment + 12 × monthlyPrice
   *   CASH    → 1 × cashPrice (no separate down payment)
   *
   * Pure function: no DB access, deterministic from its input.
   */
  static buildSchedule(input: ScheduleInput): ScheduleItem[] {
    const { paymentType, startDate } = input;

    // CASH: a single lump payment, no separate down payment. It still carries
    // the down-payment flag because it is the payment that releases the goods.
    if (paymentType === 'CASH') {
      return [
        { amount: input.cashPrice, dueDate: startDate, isDownPayment: true },
      ];
    }

    const plan = SCHEDULE_PLANS[paymentType];
    const downPayment: ScheduleItem = {
      amount: input.downPayment,
      dueDate: startDate,
      isDownPayment: true,
    };

    const installments: ScheduleItem[] = Array.from(
      { length: plan.count },
      (_, index) => ({
        amount: input[plan.priceField],
        dueDate: plan.advance(startDate, index + 1),
        isDownPayment: false,
      }),
    );

    return [downPayment, ...installments];
  }
}

interface SchedulePlan {
  count: number;
  priceField: 'dailyPrice' | 'weeklyPrice' | 'monthlyPrice';
  advance: (from: Date, periods: number) => Date;
}

const SCHEDULE_PLANS: Record<Exclude<ScheduleType, 'CASH'>, SchedulePlan> = {
  DAILY: { count: 30, priceField: 'dailyPrice', advance: addDays },
  WEEKLY: { count: 12, priceField: 'weeklyPrice', advance: addWeeks },
  MONTHLY: { count: 12, priceField: 'monthlyPrice', advance: addMonths },
};
