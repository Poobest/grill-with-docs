import { IsIn, IsOptional, IsString, IsDateString } from 'class-validator';

const PAYMENT_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY', 'CASH'] as const;

export class CreateContractDto {
  @IsString()
  customerId!: string;

  @IsString()
  productId!: string;

  @IsString()
  branchId!: string;

  @IsIn(PAYMENT_TYPES)
  paymentType!: (typeof PAYMENT_TYPES)[number];

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
