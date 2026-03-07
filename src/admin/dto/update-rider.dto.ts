import { Transform } from 'class-transformer';
import {
    IsAlpha,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumberString,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateRiderDto {
    @IsNotEmpty()
    @IsString()
    @IsAlpha()
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

    @Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'true') return true;
            if (lower === 'false') return false;
        }
        return value;
    })
    // @Type(() => Boolean)
    @IsBoolean()
    isOnline: boolean;

    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Invalid Bangladesh phone number',
    })
    bkashAccount: string;

    @IsNumberString()
    @MinLength(10)
    bankAccount: string;
}
