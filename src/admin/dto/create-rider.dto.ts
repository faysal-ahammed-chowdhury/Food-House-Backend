import { Transform } from 'class-transformer';
import {
    IsAlpha,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Length,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateRiderDto {
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

    @IsPhoneNumber('BD')
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

    @IsOptional()
    @IsPhoneNumber('BD')
    bkashAccount?: string;

    @IsOptional()
    @IsNumberString()
    @MinLength(10)
    bankAccount?: string;
}
