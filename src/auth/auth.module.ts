import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DBModule } from 'src/db/db.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constant';

@Module({
    imports: [
        DBModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [],
})
export class AuthModule {}
