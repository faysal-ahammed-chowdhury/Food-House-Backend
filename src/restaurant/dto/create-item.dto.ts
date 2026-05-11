import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateItemDto {
    @IsNotEmpty()
    name!: string;

    @MaxLength(200)
    description?: string;

    @Min(0)
    @IsNumber()
    price!: number;

    @IsOptional()
    imageUrl?: string;

    @IsOptional()
    isAvailable?: boolean;

    @IsNumber()
    preparationTime!: number;

    @IsNumber()
    categoryId!: number;

    @IsNumber()
    restaurantId!: number;
}
