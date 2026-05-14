import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/common/entities/category.entity';
import { CustomerEntity } from 'src/common/entities/customer.entity';
import { DeliveryEntity } from 'src/common/entities/delivery.entity';
import { ForgotPassEntity } from 'src/common/entities/forgotpass.entity';
import { ItemEntity } from 'src/common/entities/item.entity';
import { OrderItemEntity } from 'src/common/entities/order-item.entity';
import { OrderEntity } from 'src/common/entities/order.entity';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { RiderEntity } from 'src/common/entities/rider.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { VoucherEntity } from 'src/common/entities/voucher.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            RestaurantEntity,
            CustomerEntity,
            RiderEntity,
            CategoryEntity,
            ItemEntity,
            VoucherEntity,
            OrderEntity,
            DeliveryEntity,
            OrderItemEntity,
            ForgotPassEntity 
        ]),
    ],
    exports: [TypeOrmModule],
})
export class DBModule {}
