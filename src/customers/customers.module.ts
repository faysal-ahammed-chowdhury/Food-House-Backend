import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from '../common/entities/customer.entity';
import { OrderEntity } from '../common/entities/order.entity';
import { UserEntity } from '../common/entities/user.entity';
import { OrderItemEntity } from '../common/entities/order-item.entity'; 
import { RestaurantEntity } from '../common/entities/restaurant.entity';
import { CategoryEntity } from '../common/entities/category.entity';
import { ItemEntity } from '../common/entities/item.entity';
import { VoucherEntity } from 'src/common/entities/voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    CustomerEntity, 
    UserEntity, 
    OrderEntity, 
    OrderItemEntity,
    RestaurantEntity, 
    CategoryEntity,    
    ItemEntity,
    VoucherEntity    
  ])],
  controllers: [CustomersController], 
  providers: [CustomersService],      
})
export class CustomersModule {}