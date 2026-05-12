import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RiderModule } from './rider/rider.module';


@Module({
    imports: [
        AdminModule,
        AuthModule,
        RestaurantModule,
        RiderModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '12345',
            database: 'foodhouse',
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
                    user: 'faysal.a.chowdhury.1@gmail.com',
                    pass: 'jbpafbyzkunplhba',
                },
            },
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
