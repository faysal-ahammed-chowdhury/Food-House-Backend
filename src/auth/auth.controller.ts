import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
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
    async signIn(@Body() loginDto: LoginDto): Promise<object> {
        return this.authService.signIn(loginDto.email, loginDto.password);
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
}
