import { MailerService } from '@nestjs-modules/mailer';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CustomerEntity } from 'src/common/entities/customer.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) {}

    /* ========== Common ========== */

    // check email exist or not
    async checkEmailExist(email: string): Promise<boolean> {
        const foundEmail = await this.userRepository.findOne({
            where: { email: email },
        });

        return Boolean(foundEmail);
    }

    // sign in logic for any user
    async signIn(
        email: string,
        pass: string,
    ): Promise<{
        token: string;
        data: any;
    }> {
        const user = await this.userRepository.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            throw new NotFoundException('User Not Found');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email first');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new UnauthorizedException(
                'Email and Password did not matched',
            );
        }

        const payload = {
            name: user.name,
            userId: user.userId,
            email: user.email,
            role: user.role,
        };

        const { password, isVerified, verificationToken, ...result } = user;

        const token = await this.jwtService.signAsync(payload);

        return {
            data: result,
            token: token,
        };
    }

    async getUserById(userId: number): Promise<object> {
        const user = await this.userRepository.findOne({
            select: ['userId', 'name', 'email', 'role'],
            where: { userId: userId },
        });
        if (!user) {
            throw new NotFoundException(`User not found with id ${userId}`);
        }
        return {
            success: true,
            message: 'User Found',
            data: user,
        };
    }

    // sign up for any user
    async signUp(signUpDto: SignUpDto): Promise<object> {
        const emailExists = await this.checkEmailExist(signUpDto.email);
        if (emailExists) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

        const customer = await this.customerRepository.save({
            user: {
                name: signUpDto.name,
                email: signUpDto.email,
                password: hashedPassword,
                role: UserRoles.CUSTOMER,
                isVerified: false,
                verificationToken: null,
            },
            address: signUpDto.address,
            phone: signUpDto.phone,
        });

        try {
            await this.sendVerificationLink(customer.user.userId);

            const { password, verificationToken, ...userWithoutPassword } =
                customer.user;

            return {
                success: true,
                message:
                    'User created successfully. Check your email for verification.',
                data: {
                    ...customer,
                    user: userWithoutPassword,
                },
            };
        } catch {
            await this.userRepository.delete(customer.user.userId);
            throw new BadRequestException('Failed to create user, try again.');
        }
    }

    // send verification link
    async sendVerificationLink(userId: number): Promise<object> {
        const user = await this.userRepository.findOne({
            where: { userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('User is already verified');
        }

        const verificationTokenHere: string = String(Date.now());
        const verificationLink = `http://localhost:3000/auth/verify/${userId}/${verificationTokenHere}`;

        user.verificationToken = verificationTokenHere;
        const newUser = await this.userRepository.save(user);

        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Verify Your Email - Food House',
                html: `
                <h2>Welcome, ${user.name}!</h2>
                <p>Click the link below to verify your email:</p>
                <a href="${verificationLink}">Verify Email</a>
            `,
            });

            const { password, verificationToken, ...userWithoutPassword } =
                newUser;

            return userWithoutPassword;
        } catch {
            user.verificationToken = null;
            await this.userRepository.save(user);
            throw new BadRequestException(
                'Failed to send verification, try again',
            );
        }
    }

    // user verification
    async verifyUser(id: number, token: string) {
        const userExists = await this.userRepository.findOneBy({ userId: id });
        if (!userExists) {
            throw new BadRequestException('Invalid User');
        }

        const user = await this.userRepository.findOne({
            where: {
                userId: id,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid User');
        }

        if (user.isVerified) {
            throw new BadRequestException('User already verified');
        }

        if (user.verificationToken != token) {
            throw new UnauthorizedException('Invalid Token');
        }

        user.isVerified = true;
        user.verificationToken = null;
        await this.userRepository.save(user);

        return {
            success: true,
            message: 'User verified',
        };
    }
}
