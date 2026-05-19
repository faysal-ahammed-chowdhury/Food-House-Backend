import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptDeliveryDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    riderId!: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    orderId!: number;
} 