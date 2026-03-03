import { Module } from '@nestjs/common';
import { AdminModule } from './Admin/admin.module';

@Module({
    imports: [AdminModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
