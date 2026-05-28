import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustStockDto, UpdateStockDto } from './dto/stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findByBranch(tenantId: string, branchId: string) {
    await this.validateBranch(tenantId, branchId);
    return this.prisma.branchStock.findMany({
      where: { tenantId, branchId },
      include: { product: { select: { id: true, name: true, isActive: true } } },
      orderBy: { product: { name: 'asc' } },
    });
  }

  async setStock(tenantId: string, branchId: string, dto: UpdateStockDto & { productId: string }) {
    await this.validateBranch(tenantId, branchId);
    return this.prisma.branchStock.upsert({
      where: { branchId_productId: { branchId, productId: dto.productId } },
      update: { quantity: dto.quantity, tenantId },
      create: { branchId, productId: dto.productId, quantity: dto.quantity, tenantId },
    });
  }

  async adjustStock(tenantId: string, branchId: string, dto: AdjustStockDto) {
    await this.validateBranch(tenantId, branchId);
    const current = await this.prisma.branchStock.findUnique({
      where: { branchId_productId: { branchId, productId: dto.productId } },
    });

    const newQty = (current?.quantity ?? 0) + dto.quantity;
    if (newQty < 0) {
      throw new BadRequestException('Stock cannot go below 0');
    }

    return this.prisma.branchStock.upsert({
      where: { branchId_productId: { branchId, productId: dto.productId } },
      update: { quantity: newQty },
      create: { branchId, productId: dto.productId, quantity: newQty, tenantId },
    });
  }

  // เรียกใช้เมื่อ approve เงินดาวน์ — ใช้ transaction เพื่อป้องกัน race condition
  async decrementOnDownPayment(
    tenantId: string,
    branchId: string,
    productId: string,
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ) {
    const stock = await tx.branchStock.findUnique({
      where: { branchId_productId: { branchId, productId } },
    });

    if (!stock || stock.quantity < 1) {
      throw new BadRequestException('Product out of stock');
    }

    return tx.branchStock.update({
      where: { branchId_productId: { branchId, productId } },
      data: { quantity: stock.quantity - 1 },
    });
  }

  // เรียกใช้เมื่อ Admin cancel contract
  async incrementOnCancellation(
    tenantId: string,
    branchId: string,
    productId: string,
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ) {
    return tx.branchStock.update({
      where: { branchId_productId: { branchId, productId } },
      data: { quantity: { increment: 1 } },
    });
  }

  private async validateBranch(tenantId: string, branchId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenantId, isActive: true },
    });
    if (!branch) throw new NotFoundException('Branch not found');
  }
}
