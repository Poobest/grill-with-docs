import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRateCash?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRateInstallment?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRateCash?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRateInstallment?: number;
}
