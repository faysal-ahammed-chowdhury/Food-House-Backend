import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateCustomerDto {
    @IsNotEmpty({ message: 'Name is required.' })
    @IsString({ message: 'Name must be valid text.' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters.' })
    name: string;

    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Email must be valid.' })
    @MaxLength(100, { message: 'Email must not exceed 100 characters.' })
    email: string;

    @IsNotEmpty({ message: 'Password is required.' })
    @IsString({ message: 'Password must be valid text.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    @MaxLength(32, { message: 'Password must not exceed 32 characters.' })
    password: string;

    @IsNotEmpty({ message: 'Address is required.' })
    @IsString({ message: 'Address must be valid text.' })
    @MaxLength(100, { message: 'Address must not exceed 100 characters.' })
    address: string;

    @IsNotEmpty({ message: 'Phone number is required.' })
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Phone number must be a valid Bangladeshi number.',
    })
    phone: string;
}
