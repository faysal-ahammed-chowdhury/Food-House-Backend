import { IsBoolean, IsNumber, IsString, Matches } from "class-validator";

export class CreateMenuItemDto {
  @IsNumber()
  id: number;
  
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'Menu item name must contain only letters and spaces' })
  name: string;
  
  @IsNumber()
  price: number;

  @IsBoolean()
  availability: boolean;
  
  @IsNumber()
  preparationTime: number;
  
  @IsString()
  image:string;
}