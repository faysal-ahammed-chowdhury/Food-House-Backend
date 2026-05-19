import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UpdateDeliveryDto {
  @IsNumber()
  @Type(() => Number)
  orderId!: number;

  @IsNumber()
  @Type(() => Number)
  riderId!: number;
}