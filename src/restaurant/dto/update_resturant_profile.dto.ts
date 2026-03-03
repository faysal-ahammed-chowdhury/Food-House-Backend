import { match } from "assert";
import { IsEmail, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

export class UpdateRestaurantProfileDto {
    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z]+$/, { message: 'Invalid Name' })
    name?: string;

    @IsOptional()
    @IsString()
    @IsEmail({}, { message: 'Invalid email format' })
    @Matches(/@gmail\.com$/, { message: 'Email must be a Gmail address' })
    mail?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @Matches(/^01\d{9}$/, { message: 'Contact number must start with 01 and be followed by 9 digits' })
    contactNumber?: string;
    
    @IsOptional()
    @IsString()
    openingHours?: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/\d/, { message: 'Password must contain at least one number' })
    password?: string;
}