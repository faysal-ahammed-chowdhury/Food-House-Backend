import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
    imports: [
        AdminModule,
        AuthModule,
        RestaurantModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: true,
            // dropSchema: true,
        }),
        MailerModule.forRoot({
            transport: {
                host: process.env.MAILER_HOST || '',
                port: process.env.MAILER_PORT || '',
                secure: false,
                auth: {
                    user: process.env.MAILER_AUTH_USER,
                    pass: process.env.MAILER_AUTH_PASS,
                },
            },
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
