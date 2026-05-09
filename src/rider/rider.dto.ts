
import { Optional } from "@nestjs/common";
import { IsEmail, IsIn, ValidateIf ,IsNumber, IsBoolean, IsNotEmpty, IsNumberString, IsOptional, IsString, Length, Matches, MaxLength, MinLength, IS_OPTIONAL } from "class-validator";

export class CreateRiderDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    @MaxLength(32)
    password!: string;

    
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Invalid Bangladesh phone number',
    })
    phone!: string;

    @IsNumberString()
    @Length(10, 17)
    riderNid!: string;

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

export class UpdateRiderDto {
   
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsOptional()
    @Matches(/^(?:\+88)?01[0-9]{9}$/, {
        message: 'Invalid Bangladesh phone number',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    password?: string;
}

export class RiderStatusDto {
     @IsOptional()
    @IsBoolean()
    isOnline?: boolean;
}
export class AssignDeliveryDto {
    @IsNotEmpty() riderId!: number;
    @IsNotEmpty() deliveryId!: number;
}


/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

