import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { get } from 'http';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
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
            maxAge: 1000 * 60 * 60 * 1,
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

    // verify user route
    @Post('verify/:id/:token')
    async verifyUser(
        @Param('id', ParseIntPipe) id: number,
        @Param('token') token: string,
    ): Promise<object> {
        return this.authService.verifyUser(id, token);
    }

    // logout route
    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response): object {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        return { success: true, message: 'Logged out' };
    }

    // get loggedin user route
    @Get('me')
    async me(@Req() req: Request) {
        const token = req.cookies?.token;

        // console.log(token);

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const res = await this.jwtService.verifyAsync(token);
            const userId: number = res?.userId;
            // console.log('user id: ', this.adminService.getAdmin(userId));
            const user = await this.authService.getUserById(userId);
            return user;
        } catch {
            throw new UnauthorizedException();
        }
    }


    ///////////////////FORGET PASSWORD////////////////////
    @Get('email_exist/:email')  //0 mane user exist kore na
    async getUserIdByEmail(@Param('email') email: string): Promise<{ userId: number }> {
        return this.authService.getUserIdByEmail(email);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() data: { userId: number, email: string }) {
        const { userId, email } = data;
        await this.authService.forgotPass(userId, email);
        return { message: 'If a restaurant with that email exists, a password reset link has been sent.' };
    }

    @Get('checkOTP/:userId/:otp')
    async checkOTP(@Param('userId', ParseIntPipe) userId: number, @Param('otp') otp: string): Promise<{ success: boolean; time: boolean }> {
        return await this.authService.checkOTP(userId, otp);
    }

    @Post('new_password')
    async resetPassword(@Body() data: { userId: number, newPassword: string }):Promise<{ message: string }> {
        const { userId, newPassword } = data;
        return await this.authService.resetPassword(userId, newPassword);
    }
}
