import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateRestaurantDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(32)
    password: string;

    @IsOptional()
    @MaxLength(100)
    description?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    address: string;

    @IsBoolean()
    isOpen: boolean;

    @IsNumber()
    @Max(100)
    @Min(0)
    currentCommissionPercent: number;

    @IsNumber()
    currentDeliveryFee: number;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Invalid Bangladesh phone number',
    })
    bkashAccount?: string;

    @IsOptional()
    @IsNumberString()
    @MinLength(10)
    bankAccount?: string;
}
