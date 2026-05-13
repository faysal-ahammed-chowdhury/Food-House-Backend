import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from '../common/entities/customer.entity';
import { OrderEntity } from '../common/entities/order.entity';
import { UserEntity } from '../common/entities/user.entity';
import { OrderItemEntity } from '../common/entities/order-item.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, UserEntity, OrderEntity, OrderItemEntity])],
  controllers: [CustomersController], 
  providers: [CustomersService],      
})
export class CustomersModule {}