import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    isAvailable: boolean;

    @IsNumber()
    restaurantId: number;
}
