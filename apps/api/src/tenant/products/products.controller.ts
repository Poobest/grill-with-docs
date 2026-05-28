import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @Roles(UserRole.TENANT_ADMIN)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateProductDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
