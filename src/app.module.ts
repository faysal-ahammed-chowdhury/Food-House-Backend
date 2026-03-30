import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        AdminModule,
        AuthModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'root',
            database: 'foodhouse',
            autoLoadEntities: true,
            synchronize: true,
            // dropSchema: true,
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
