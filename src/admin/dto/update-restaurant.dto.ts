import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateRestaurantDto {
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

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    description: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    address: string;

    @IsBoolean()
    isOpen: boolean;

    @IsNumber()
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

    @IsNumber()
    withdrawableBalance: number;
}
