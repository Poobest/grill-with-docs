import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from './stock.service';

export class SetStockDto {
  @IsString()
  branchId!: string;

  @IsString()
  productId!: string;

  @IsInt()
  @Min(0)
  quantity!: number;
}

@Controller('stock')
export class StockController {
  constructor(
    private readonly stock: StockService,
    private readonly prisma: PrismaService,
  ) {}

  /** Current stock levels across the tenant's branches. */
  @Get()
  async list(@TenantId() tenantId: string) {
    const rows = await this.prisma.branchStock.findMany({
      where: { tenantId },
      include: {
        branch: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { product: { name: 'asc' } },
    });
    return rows.map((r) => ({
      branchId: r.branchId,
      productId: r.productId,
      branchName: r.branch.name,
      productName: r.product.name,
      quantity: r.quantity,
    }));
  }

  @Post()
  set(@TenantId() tenantId: string, @Body() dto: SetStockDto) {
    return this.stock.set(
      { tenantId, branchId: dto.branchId, productId: dto.productId },
      dto.quantity,
    );
  }
}
