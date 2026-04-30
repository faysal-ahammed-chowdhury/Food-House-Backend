import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Category name is required.' })
    @IsString({ message: 'Category name must be valid text.' })
    @MaxLength(100, {
        message: 'Category name must not exceed 100 characters.',
    })
    name: string;
}
