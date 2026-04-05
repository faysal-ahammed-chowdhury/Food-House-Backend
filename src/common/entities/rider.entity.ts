import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { DeliveryEntity } from './delivery.entity';
import { UserEntity } from './user.entity';

@Entity('riders')
export class RiderEntity {
    @PrimaryGeneratedColumn()
    riderId: number;

    @OneToOne(() => UserEntity, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    phone: string;

    @Column({ unique: true })
    riderNid: string;

    @Column()
    nidImageUrl: string;

    @Column('boolean')
    isOnline: boolean;

    @Column({ nullable: true })
    bkashAccount?: string;

    @Column({ nullable: true })
    bankAccount?: string;

    @OneToMany(() => DeliveryEntity, (delivery) => delivery.rider)
    deliveries: DeliveryEntity[];
}
