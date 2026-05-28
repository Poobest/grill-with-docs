import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  subscriptionMonths?: number;
}

export class ExtendSubscriptionDto {
  @IsInt()
  @IsPositive()
  months: number;
}
