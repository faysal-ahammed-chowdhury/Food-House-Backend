import { 
  IsNotEmpty, 
  IsUrl, 
  IsDateString, 
  Matches, 
  IsOptional, 
  IsEmail, 
  IsString, 
  MinLength, 
  Length,
  IsNumberString 
} from 'class-validator';

export class CreateCustomerDto {
  
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a text string' })
  @Matches(/^[^0-9]+$/, { message: 'Name field should not contain any numbers' })
  name!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a text string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[@#$&]/, { message: 'Password must contain one of the special characters (@, #, $, or &)' })
  password!: string;



  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a text string' })
  @IsNumberString({}, { message: 'Phone number must contain only numbers' })
  @Length(11, 11, { message: 'Phone number must be exactly 11 digits long' })
  @Matches(/^01/, { message: 'Phone number must start with 01' })
  phone!: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a text string' })
  address!: string;
}

export class UpdateCustomerDto {
  
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty if you are trying to update it' })
  @IsString({ message: 'Name must be a text string' })
  @Matches(/^[^0-9]+$/, { message: 'Name field should not contain any numbers' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Email cannot be empty if you are trying to update it' })
  @IsEmail({}, { message: 'Please provide a valid email format' })
  email?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Password cannot be empty if you are trying to update it' })
  @IsString({ message: 'Password must be a text string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[@#$&]/, { message: 'Password must contain one of the special characters (@, #, $, or &)' })
  password?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Phone number cannot be empty if you are trying to update it' })
  @IsString({ message: 'Phone number must be a text string' })
  @IsNumberString({}, { message: 'Phone number must contain only numbers' })
  @Length(11, 11, { message: 'Phone number must be exactly 11 digits long' })
  @Matches(/^01/, { message: 'Phone number must start with 01' })
  phone?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Address cannot be empty if you are trying to update it' })
  @IsString({ message: 'Address must be a text string' })
  address?: string;
}