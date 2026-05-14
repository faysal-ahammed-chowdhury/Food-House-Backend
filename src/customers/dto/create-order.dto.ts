import { IsString, IsNumber, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsNumber()
  @IsOptional()
  itemId?: number;

  @IsString()
  foodName!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  price!: number;
}

export class CreateOrderDto {
  @IsString()
  restaurantName!: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];
}