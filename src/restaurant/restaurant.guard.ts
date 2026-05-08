import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserRoles } from '../common/enums/user-roles.enum';

@Injectable()
export class RestaurantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.role !== UserRoles.RESTAURANT) {
            throw new ForbiddenException('Only restaurant users allowed');
        }
        return true;
    }
}
