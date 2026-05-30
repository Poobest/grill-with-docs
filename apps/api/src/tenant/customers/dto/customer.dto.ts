import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  phone!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  contractLimit?: number;
}

export class SetSuspendedDto {
  @IsBoolean()
  isSuspended!: boolean;
}
