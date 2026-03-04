import { UserRoles } from 'src/common/enums/user-roles.enum';

export class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRoles;
}
