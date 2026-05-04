import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Post,
    Res,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.authService = authService;
    }

    // Sign In route for any user
    @Post('login')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async signIn(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<object> {
        const { token, data } = await this.authService.signIn(
            loginDto.email,
            loginDto.password,
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return {
            success: true,
            message: 'Login successful',
            data: data,
        };
    }

    // signup route for customer
    @Post('signup')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async signUp(@Body() signUpDto: SignUpDto): Promise<object> {
        return this.authService.signUp(signUpDto);
    }

    // verify user
    @Post('verify/:id/:token')
    async verifyUser(
        @Param('id', ParseIntPipe) id: number,
        @Param('token') token: string,
    ): Promise<object> {
        return this.authService.verifyUser(id, token);
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        return { success: true, message: 'Logged out' };
    }
}
