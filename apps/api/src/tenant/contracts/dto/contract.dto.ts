import { PaymentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;
}
