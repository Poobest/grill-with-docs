import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  maxBranches: number;

  @IsNumber()
  @IsPositive()
  maxUsers: number;

  @IsNumber()
  @Min(0)
  pricePerMonth: number;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxBranches?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerMonth?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
