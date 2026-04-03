import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateCustomerDto {
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
    address: string;

    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Invalid Bangladesh phone number',
    })
    phone: string;
}
