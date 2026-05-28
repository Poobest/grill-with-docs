import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class SetContractLimitDto {
  @IsInt()
  @Min(1)
  contractLimit: number;
}

export class ClaimCustomerDto {
  @IsString()
  @IsNotEmpty()
  claimCode: string;

  @IsString()
  @IsNotEmpty()
  lineUserId: string;
}
