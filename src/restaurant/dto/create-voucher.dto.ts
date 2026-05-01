import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsNumber()
  restaurantId!: number;
  @IsNotEmpty()
  @IsString()
  voucherCode!: string;

  @IsNotEmpty()
  @IsNumber()
  percent!: number;

  @IsNotEmpty()
  @IsNumber()
  maxDiscount!: number;

  @IsNotEmpty()
  @IsNumber()
  minOrderAmount!: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}