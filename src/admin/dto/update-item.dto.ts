import {
    IsBoolean,
    IsNumber,
    IsOptional,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateItemDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    @MaxLength(200)
    description?: string;

    @IsOptional()
    @Min(0)
    @IsNumber()
    price?: number;

    @IsOptional()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    preparationTime?: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
