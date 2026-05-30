import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

const ROLES = ['ADMIN', 'SALE_LEAD', 'SALE'] as const;

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn(ROLES)
  role!: (typeof ROLES)[number];

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installmentRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  cashRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  overrideRate?: number;
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.users.list(tenantId);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    return this.users.create(tenantId, dto);
  }
}
