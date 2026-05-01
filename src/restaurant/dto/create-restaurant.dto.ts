import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateRestaurantDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(45)
    name!: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(30)
    email!: string;

    @IsString()
    @MinLength(6)
    @MaxLength(32)
    password!: string;

    @IsOptional()
    @MaxLength(100)
    description?: string;

    @IsOptional()
    @MaxLength(255)
    bannerUrl?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    address!: string;

    @IsBoolean()
    isOpen!: boolean;

    @IsNumber()
    @Max(100)
    @Min(0)
    currentCommissionPercent!: number;

    @IsNumber()
    @Min(0)
    currentDeliveryFee!: number;

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
