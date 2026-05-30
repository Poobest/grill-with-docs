import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { BranchesService } from './branches.service';

export class CreateBranchDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;
}

@Controller('branches')
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.branches.list(tenantId);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateBranchDto) {
    return this.branches.create(tenantId, dto);
  }
}
