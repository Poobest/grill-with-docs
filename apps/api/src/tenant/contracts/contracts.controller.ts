import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CurrentUser,
  TenantId,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.contracts.list(user.tenantId);
  }

  @Get(':id')
  detail(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contracts.getDetail(tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContractDto) {
    return this.contracts.create({
      tenantId: user.tenantId,
      customerId: dto.customerId,
      productId: dto.productId,
      branchId: dto.branchId,
      saleId: user.userId,
      paymentType: dto.paymentType,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    });
  }
}
