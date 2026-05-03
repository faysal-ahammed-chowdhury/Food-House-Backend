import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { RiderEntity } from './rider.entity';

@Entity('deliveries')
export class DeliveryEntity {
    @PrimaryGeneratedColumn()
    deliveryId!: number;

    @OneToOne(() => OrderEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order!: OrderEntity;

    @ManyToOne(() => RiderEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'riderId' })
    rider!: RiderEntity;

    @Column('timestamp')
    acceptedAt!: Date;

    @Column('int', { nullable: true })
    otp!: number;

    @Column('timestamp', { nullable: true })
    pickUpTime!: Date;

    @Column('timestamp', { nullable: true })
    deliveredTime!: Date;
}
