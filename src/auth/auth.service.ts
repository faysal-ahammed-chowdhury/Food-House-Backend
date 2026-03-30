import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private jwtService: JwtService,
    ) {}

    // sign in logic for any user
    async signIn(email: string, pass: string): Promise<object> {
        const user = await this.userRepository.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            throw new NotFoundException('User Not Found');
        }

        const isMatch = await bcrypt.compare(pass, user?.password);

        if (!isMatch) {
            throw new UnauthorizedException(
                'Email and Password did not matched',
            );
        }

        const payload = {
            userId: user?.userId,
            email: user?.email,
            role: user.role,
        };

        const { password, ...result } = user;

        return {
            success: true,
            message: 'Login successful',
            data: result,
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
