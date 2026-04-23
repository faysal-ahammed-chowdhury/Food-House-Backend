import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateRestaurantDto {
    @IsNotEmpty({ message: 'Restaurant name is required.' })
    @IsString({ message: 'Name must be a valid text.' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters.' })
    name: string;

    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Email must be valid.' })
    @MaxLength(100, { message: 'Email must not exceed 100 characters.' })
    email: string;

    @IsNotEmpty({ message: 'Password is required.' })
    @IsString({ message: 'Password must be valid text.' })
    @MinLength(6, { message: 'Password must be at least 6 characters.' })
    @MaxLength(32, { message: 'Password must not exceed 32 characters.' })
    password: string;

    @IsOptional()
    @IsString({ message: 'Description must be valid text.' })
    @MaxLength(500, { message: 'Description must not exceed 500 characters.' })
    description?: string;

    @IsNotEmpty({ message: 'Address is required.' })
    @IsString({ message: 'Address must be valid text.' })
    @MaxLength(100, { message: 'Address must not exceed 100 characters.' })
    address: string;

    @IsBoolean({ message: 'isOpen must be a boolean value.' })
    isOpen: boolean;

    @IsNumber({}, { message: 'Commission must be a number.' })
    @Min(0, { message: 'Commission cannot be less than 0.' })
    @Max(100, { message: 'Commission cannot exceed 100.' })
    currentCommissionPercent: number;

    @IsNumber({}, { message: 'Delivery fee must be a number.' })
    @Min(0, { message: 'Delivery fee cannot be negative.' })
    currentDeliveryFee: number;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'bKash number is invalid.',
    })
    bkashAccount?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'Bank account must contain only numbers.' })
    @Length(10, 20, {
        message: 'Bank account must be between 10 and 20 digits.',
    })
    bankAccount?: string;
}
