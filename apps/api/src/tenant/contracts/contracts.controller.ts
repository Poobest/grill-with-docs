import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContractStatus, UserRole } from '@prisma/client';
import { CurrentTenant, CurrentUser } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { CreateContractDto } from './dto/contract.dto';
import { ContractsService } from './contracts.service';

@Controller('contracts')
@UseGuards(AuthGuard('jwt'))
export class ContractsController {
  constructor(private service: ContractsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string; role: string },
    @Query('customerId') customerId?: string,
    @Query('status') status?: ContractStatus,
  ) {
    // Sale เห็นแค่ contract ของตัวเอง
    const saleId = user.role === UserRole.SALE ? user.id : undefined;
    return this.service.findAll(tenantId, { saleId, customerId, status });
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @Roles(UserRole.SALE, UserRole.SALE_LEAD, UserRole.TENANT_ADMIN)
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateContractDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Delete(':id/cancel')
  @Roles(UserRole.TENANT_ADMIN)
  cancel(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.cancel(tenantId, id);
  }
}
