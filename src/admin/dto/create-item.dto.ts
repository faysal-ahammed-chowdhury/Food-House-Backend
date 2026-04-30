import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateItemDto {
    @IsNotEmpty({ message: 'Item name is required.' })
    @IsString({ message: 'Item name must be valid text.' })
    @MaxLength(100, { message: 'Item name must not exceed 100 characters.' })
    name: string;

    @IsNotEmpty({ message: 'Description is required.' })
    @IsString({ message: 'Description must be valid text.' })
    @MaxLength(500, { message: 'Description must not exceed 500 characters.' })
    description: string;

    @IsNotEmpty({ message: 'Price is required.' })
    @IsNumber({}, { message: 'Price must be a number.' })
    @Min(0, { message: 'Price cannot be negative.' })
    price: number;

    @IsOptional()
    @IsUrl({}, { message: 'Image URL must be valid.' })
    imageUrl?: string;

    @IsNotEmpty({ message: 'Category is required.' })
    @IsNumber({}, { message: 'Category must be a number.' })
    @Min(1, { message: 'Invalid category selected.' })
    categoryId: number;

    @IsNotEmpty({ message: 'Preparation time is required.' })
    @IsNumber({}, { message: 'Preparation time must be a number.' })
    @Min(0, { message: 'Preparation time cannot be negative.' })
    preparationTime: number;
}
