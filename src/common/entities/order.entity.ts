import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { CustomerEntity } from './customer.entity';
import { DeliveryEntity } from './delivery.entity';
import { OrderItemEntity } from './order-item.entity';
import { RestaurantEntity } from './restaurant.entity';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    orderId: number;

    @ManyToOne(() => RestaurantEntity, { cascade: true })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: RestaurantEntity;

    @ManyToOne(() => CustomerEntity, { cascade: true })
    @JoinColumn({ name: 'customerId' })
    customer: CustomerEntity;

    @Column('timestamp')
    orderAt: string;

    @Column('float')
    subtotal: number;

    @Column({ nullable: true })
    voucherCode: string;

    @Column('float')
    discountAmount: number;

    @Column('float')
    deliveryFee: number;

    @Column('float')
    total: number;

    @Column({ type: 'enum', enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Column()
    restaurantAddress: string;

    @Column()
    customerAddress: string;

    @Column({ type: 'enum', enum: OrderStatus })
    status: OrderStatus;

    @Column('float')
    commissionAmount: number;

    @Column('float')
    commissionPercentage: number;

    @Column('float')
    estimatedDeliveryTime: number;

    @OneToOne(() => DeliveryEntity, (delivery) => delivery.order, {
        nullable: true,
    })
    delivery: DeliveryEntity;

    @OneToMany(() => OrderItemEntity, (item) => item.order)
    order_items: OrderItemEntity[];
}
