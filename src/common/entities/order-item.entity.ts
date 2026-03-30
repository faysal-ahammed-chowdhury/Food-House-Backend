import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
    @PrimaryGeneratedColumn()
    orderItemId: number;

    @ManyToOne(() => OrderEntity, { cascade: true })
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @Column('int')
    itemId: number;

    @Column()
    itemName: string;

    @Column('float')
    itemPrice: number;

    @Column('float')
    quantity: number;

    @Column('float')
    total: number;
}
