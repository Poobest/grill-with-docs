import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
