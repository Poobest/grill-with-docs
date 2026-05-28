import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  cashPrice: number;

  @IsNumber()
  @Min(0)
  downPayment: number;

  @IsNumber()
  @Min(0)
  dailyPrice: number;

  @IsNumber()
  @Min(0)
  weeklyPrice: number;

  @IsNumber()
  @Min(0)
  monthlyPrice: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  downPayment?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weeklyPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyPrice?: number;
}
