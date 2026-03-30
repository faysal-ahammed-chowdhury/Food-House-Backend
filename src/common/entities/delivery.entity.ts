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
    deliveryId: number;

    @OneToOne(() => OrderEntity, { cascade: true })
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @ManyToOne(() => RiderEntity, { cascade: true })
    @JoinColumn({ name: 'riderId' })
    rider: RiderEntity;

    @Column('int')
    otp: number;

    @Column('timestamp')
    pickUpTime: string;

    @Column('timestamp', { nullable: true })
    deliveredTime: string;
}
