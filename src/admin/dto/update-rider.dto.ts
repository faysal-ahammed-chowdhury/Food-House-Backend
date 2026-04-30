import {
    IsBoolean,
    IsEmail,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateRiderDto {
    @IsOptional()
    @IsString({ message: 'Name must be valid text.' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters.' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email must be valid.' })
    @MaxLength(100, { message: 'Email must not exceed 100 characters.' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Password must be valid text.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    @MaxLength(32, { message: 'Password cannot exceed 32 characters.' })
    password?: string;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Please enter a valid Bangladeshi phone number.',
    })
    phone?: string;

    @IsOptional()
    @IsBoolean({ message: 'isOnline must be true or false.' })
    isOnline?: boolean;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Please enter a valid bKash number.',
    })
    bkashAccount?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'Bank account must contain only numbers.' })
    @Length(10, 20, {
        message: 'Bank account must be between 10 and 20 digits.',
    })
    bankAccount?: string;
}
