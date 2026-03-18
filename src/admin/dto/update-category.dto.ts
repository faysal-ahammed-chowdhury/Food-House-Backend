import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    isAvailable: boolean;
}
