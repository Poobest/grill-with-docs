import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/guards/roles.guard';
import {
  ClaimCustomerDto,
  CreateCustomerDto,
  SetContractLimitDto,
  UpdateCustomerDto,
} from './dto/customer.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query('search') search?: string) {
    return this.service.findAll(tenantId, search);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @Roles(UserRole.SALE, UserRole.SALE_LEAD, UserRole.TENANT_ADMIN)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateCustomerDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.SALE, UserRole.SALE_LEAD, UserRole.TENANT_ADMIN)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Patch(':id/limit')
  @Roles(UserRole.TENANT_ADMIN)
  setLimit(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: SetContractLimitDto,
  ) {
    return this.service.setContractLimit(tenantId, id, dto);
  }

  @Patch(':id/suspend')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALE_LEAD)
  suspend(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.suspend(tenantId, id);
  }

  @Patch(':id/unsuspend')
  @Roles(UserRole.TENANT_ADMIN)
  unsuspend(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.unsuspend(tenantId, id);
  }

  // LINE LIFF endpoint — ไม่ต้อง auth เพราะลูกค้ายังไม่มี account
  @Post('claim')
  @UseGuards() // override global JWT guard
  claim(@Body() dto: ClaimCustomerDto) {
    return this.service.claim(dto);
  }
}
