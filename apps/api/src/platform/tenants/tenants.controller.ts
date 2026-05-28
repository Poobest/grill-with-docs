import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTenantDto, ExtendSubscriptionDto } from './dto/tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('platform/tenants')
@UseGuards(AuthGuard('platform-jwt'))
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.service.create(dto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.setActive(id, true);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.setActive(id, false);
  }

  @Patch(':id/extend-subscription')
  extendSubscription(
    @Param('id') id: string,
    @Body() dto: ExtendSubscriptionDto,
  ) {
    return this.service.extendSubscription(id, dto);
  }
}
