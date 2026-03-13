import {
    IsBoolean,
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

    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Invalid Bangladesh phone number',
    })
    phone: string;

    @IsString()
    @Length(10, 10)
    riderNid: string;

    @IsBoolean()
    isOnline: boolean;

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
