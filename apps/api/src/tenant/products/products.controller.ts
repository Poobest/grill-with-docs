import { Body, Controller, Get, Post } from '@nestjs/common';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.products.list(tenantId);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateProductDto) {
    return this.products.create(tenantId, dto);
  }
}
