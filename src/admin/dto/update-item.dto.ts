import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateItemDto {
    @IsOptional()
    @IsString({ message: 'Name must be valid text.' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters.' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Description must be valid text.' })
    @MaxLength(500, { message: 'Description must not exceed 500 characters.' })
    description?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Price must be a number.' })
    @Min(0, { message: 'Price cannot be negative.' })
    price?: number;

    @IsOptional()
    @IsUrl({}, { message: 'Image URL must be valid.' })
    imageUrl?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Preparation time must be a number.' })
    @Min(0, { message: 'Preparation time cannot be negative.' })
    preparationTime?: number;

    @IsOptional()
    @IsBoolean({ message: 'Availability must be true or false.' })
    isAvailable?: boolean;
}
