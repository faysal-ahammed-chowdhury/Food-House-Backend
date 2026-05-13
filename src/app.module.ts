import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RiderModule } from './rider/rider.module';
import { CustomersModule } from './customers/customers.module';


@Module({
    imports: [
        AdminModule,
        AuthModule,
        RestaurantModule,
        CustomersModule,
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
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            },
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
