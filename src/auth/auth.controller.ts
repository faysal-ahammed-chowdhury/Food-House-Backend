import {
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.authService = authService;
    }

    // Sign In route for any user
    @Post('login')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async signIn(@Body() loginDto: LoginDto): Promise<object> {
        return this.authService.signIn(loginDto.email, loginDto.password);
    }
}
