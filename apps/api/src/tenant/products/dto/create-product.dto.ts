import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  cashPrice!: number;

  @IsNumber()
  @Min(0)
  downPayment!: number;

  @IsNumber()
  @Min(0)
  dailyPrice!: number;

  @IsNumber()
  @Min(0)
  weeklyPrice!: number;

  @IsNumber()
  @Min(0)
  monthlyPrice!: number;
}
