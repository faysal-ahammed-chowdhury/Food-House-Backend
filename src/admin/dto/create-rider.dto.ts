import {
    IsEmail,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateRiderDto {
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

    @IsNotEmpty({ message: 'Phone number is required.' })
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Phone number must be a valid Bangladeshi number.',
    })
    phone: string;

    @IsNotEmpty({ message: 'NID number is required.' })
    @IsNumberString({}, { message: 'NID must contain only numbers.' })
    @Length(10, 17, {
        message: 'NID must be between 10 and 17 digits.',
    })
    riderNid: string;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'bKash number must be a valid Bangladeshi number.',
    })
    bkashAccount?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'Bank account must contain only numbers.' })
    @Length(10, 20, {
        message: 'Bank account must be between 10 and 20 digits.',
    })
    bankAccount?: string;
}
