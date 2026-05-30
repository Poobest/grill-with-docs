import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductListItem {
  id: string;
  name: string;
  cashPrice: number;
  downPayment: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a product for a tenant. */
  async create(
    tenantId: string,
    data: Omit<ProductListItem, 'id'> & { description?: string },
  ): Promise<ProductListItem> {
    const product = await this.prisma.product.create({
      data: { tenantId, ...data },
    });
    return {
      id: product.id,
      name: product.name,
      cashPrice: Number(product.cashPrice),
      downPayment: Number(product.downPayment),
      dailyPrice: Number(product.dailyPrice),
      weeklyPrice: Number(product.weeklyPrice),
      monthlyPrice: Number(product.monthlyPrice),
    };
  }

  /** Active products for a tenant, with all price fields as numbers. */
  async list(tenantId: string): Promise<ProductListItem[]> {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      cashPrice: Number(p.cashPrice),
      downPayment: Number(p.downPayment),
      dailyPrice: Number(p.dailyPrice),
      weeklyPrice: Number(p.weeklyPrice),
      monthlyPrice: Number(p.monthlyPrice),
    }));
  }
}
