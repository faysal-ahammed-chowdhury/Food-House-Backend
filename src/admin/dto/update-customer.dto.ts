import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateCustomerDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Name cannot be empty.' })
    @IsString({ message: 'Name must be valid text.' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters.' })
    name?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Password cannot be empty.' })
    @IsString({ message: 'Password must be valid text.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    @MaxLength(32, { message: 'Password cannot exceed 32 characters.' })
    password?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Address cannot be empty.' })
    @IsString({ message: 'Address must be valid text.' })
    @MaxLength(100, { message: 'Address cannot exceed 100 characters.' })
    address?: string;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message:
            'Please enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX).',
    })
    phone?: string;
}
