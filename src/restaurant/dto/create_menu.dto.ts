import { Matches} from "class-validator";

export class CreateMenuDto {
    @Matches(/^[A-Za-z\s]+$/, { message: 'Menu name must contain only letters and spaces' })
    name: string;
}