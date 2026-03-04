import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [],
})
export class AdminModule {}
