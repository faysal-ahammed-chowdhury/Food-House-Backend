import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.role !== UserRoles.ADMIN) {
            throw new ForbiddenException('Only admins allowed');
        }
        return true;
    }
}
