import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { AdjustStockDto, UpdateStockDto } from './dto/stock.dto';
import { StockService } from './stock.service';

@Controller('branches/:branchId/stock')
@UseGuards(AuthGuard('jwt'))
export class StockController {
  constructor(private service: StockService) {}

  @Get()
  findByBranch(@CurrentTenant() tenantId: string, @Param('branchId') branchId: string) {
    return this.service.findByBranch(tenantId, branchId);
  }

  @Post('set')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALE_LEAD)
  setStock(
    @CurrentTenant() tenantId: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateStockDto & { productId: string },
  ) {
    return this.service.setStock(tenantId, branchId, dto);
  }

  @Patch('adjust')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALE_LEAD)
  adjustStock(
    @CurrentTenant() tenantId: string,
    @Param('branchId') branchId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.service.adjustStock(tenantId, branchId, dto);
  }
}
