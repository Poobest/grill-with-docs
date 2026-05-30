import { Controller, Get } from '@nestjs/common';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.products.list(tenantId);
  }
}
