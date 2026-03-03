import { IsNumber, IsString } from "class-validator";

export class CreateVoucherDto {
    @IsNumber()
    id: number;

    @IsString()
    voucherCode: string;

    @IsNumber()
    discountPercentage: number;

    @IsNumber()
    maxDiscountAmount: number;
}