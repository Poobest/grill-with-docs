import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, SetSuspendedDto } from './dto/customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.customers.list(tenantId);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateCustomerDto) {
    return this.customers.create(tenantId, dto);
  }

  @Patch(':id/suspend')
  setSuspended(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: SetSuspendedDto,
  ) {
    return this.customers.setSuspended(tenantId, id, dto.isSuspended);
  }
}
