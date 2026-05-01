import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    restaurantId!: number;
}
