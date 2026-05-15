import { IsString, IsNumber, ValidateNested, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
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
  @IsNumber()
  @IsNotEmpty()
  restaurantId!: number;
  
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