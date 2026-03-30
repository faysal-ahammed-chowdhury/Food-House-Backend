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

    @Post('login')
    @UsePipes(new ValidationPipe())
    async signIn(@Body() loginDto: LoginDto): Promise<object> {
        return this.authService.signIn(loginDto.email, loginDto.password);
    }
}
