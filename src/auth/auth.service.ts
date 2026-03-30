import { Injectable } from '@nestjs/common';
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

    async signIn(email: string, pass: string): Promise<object> {
        try {
            const data = await this.userRepository.findOne({
                where: {
                    email: email,
                },
            });

            if (!data) {
                return {
                    success: false,
                    message: 'User Not Found',
                };
            }

            const isMatch = await bcrypt.compare(pass, data?.password);

            if (!isMatch) {
                return {
                    success: false,
                    message: 'Email and Password did not matched',
                };
            }

            const payload = { sub: data?.userId, email: data?.email };

            const { password, ...result } = data;

            return {
                success: true,
                message: 'Login successful',
                result,
                access_token: await this.jwtService.signAsync(payload),
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: 'Something wrong, try again!!',
            };
        }
    }
}
