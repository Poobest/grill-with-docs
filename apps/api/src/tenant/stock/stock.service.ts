import { BadRequestException, Injectable } from '@nestjs/common';
import type { BranchStock } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface StockKey {
  tenantId: string;
  branchId: string;
  productId: string;
}

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  /** Sets the absolute stock quantity for a product at a branch. */
  async set(key: StockKey, quantity: number): Promise<BranchStock> {
    if (quantity < 0) {
      throw new BadRequestException('จำนวนสต็อกต้องไม่ติดลบ');
    }
    return this.prisma.branchStock.upsert({
      where: {
        branchId_productId: {
          branchId: key.branchId,
          productId: key.productId,
        },
      },
      create: {
        tenantId: key.tenantId,
        branchId: key.branchId,
        productId: key.productId,
        quantity,
      },
      update: { quantity },
    });
  }

  /** Applies a relative delta (positive or negative) to stock, never below 0. */
  async adjust(key: StockKey, delta: number): Promise<BranchStock> {
    const current = await this.requireRow(key);
    const next = current.quantity + delta;
    if (next < 0) {
      throw new BadRequestException('สต็อกไม่เพียงพอ');
    }
    return this.write(key, next);
  }

  /** Decrements stock by one when a down payment is approved (goods leave the store). */
  async decrementOnDownPayment(key: StockKey): Promise<BranchStock> {
    const current = await this.requireRow(key);
    if (current.quantity < 1) {
      throw new BadRequestException('สินค้าหมดสต็อกที่สาขานี้');
    }
    return this.write(key, current.quantity - 1);
  }

  /** Returns one unit to stock when a contract is cancelled. */
  async incrementOnCancel(key: StockKey): Promise<BranchStock> {
    const current = await this.requireRow(key);
    return this.write(key, current.quantity + 1);
  }

  private async requireRow(key: StockKey): Promise<BranchStock> {
    const row = await this.prisma.branchStock.findUnique({
      where: {
        branchId_productId: {
          branchId: key.branchId,
          productId: key.productId,
        },
      },
    });
    if (!row) {
      throw new BadRequestException('ไม่พบสต็อกสินค้าสำหรับสาขานี้');
    }
    return row;
  }

  private write(key: StockKey, quantity: number): Promise<BranchStock> {
    return this.prisma.branchStock.update({
      where: {
        branchId_productId: {
          branchId: key.branchId,
          productId: key.productId,
        },
      },
      data: { quantity },
    });
  }
}
