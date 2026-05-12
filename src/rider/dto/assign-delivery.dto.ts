import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignDeliveryDto {
    @IsNotEmpty()
    @IsNumber()
    riderId!: number;

    @IsNotEmpty()
    @IsNumber()
    orderId!: number;
}