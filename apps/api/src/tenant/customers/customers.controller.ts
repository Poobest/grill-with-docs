import { Controller, Get } from '@nestjs/common';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.customers.list(tenantId);
  }
}
