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
}
