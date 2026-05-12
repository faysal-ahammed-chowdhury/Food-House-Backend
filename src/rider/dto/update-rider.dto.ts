import { IsOptional, IsString, Matches, IsNumberString, Length } from 'class-validator';

export class UpdateRiderDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, { message: 'Phone number must be a valid Bangladeshi number' })
    phone?: string;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, { message: 'bKash number must be a valid Bangladeshi number' })
    bkashAccount?: string;

    @IsOptional()
    @IsNumberString()
    @Length(10, 20)
    bankAccount?: string;

    @IsOptional()
    nidImage?: string;
}