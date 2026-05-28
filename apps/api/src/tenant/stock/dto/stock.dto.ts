import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  @Min(0)
  quantity: number;
}

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  quantity: number; // บวกหรือลบได้ (ปรับเพิ่ม/ลด)
}
