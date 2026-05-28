import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RecordCashDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

export class SubmitSlipDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsOptional()
  slipImageUrl?: string;
}
