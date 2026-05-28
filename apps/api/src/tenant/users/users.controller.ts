import {
  Body,
  Controller,
  Delete,
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
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
@Roles(UserRole.TENANT_ADMIN)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query('role') role?: UserRole) {
    return this.service.findAll(tenantId, role);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateUserDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.deactivate(tenantId, id);
  }
}
