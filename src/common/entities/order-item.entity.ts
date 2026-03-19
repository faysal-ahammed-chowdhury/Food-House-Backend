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

    @Column('decimal')
    itemPrice: number;

    @Column('decimal')
    quantity: number;

    @Column('decimal')
    total: number;
}
