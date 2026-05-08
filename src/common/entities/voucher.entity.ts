import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

@Entity('vouchers')
export class VoucherEntity {
    @PrimaryGeneratedColumn()
    voucherId!: number;

    @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurantId' })
    restaurant!: RestaurantEntity;

    @Column()
    voucherCode!: string;

    @Column('float')
    percent!: number;

    @Column('float')
    maxDiscount!: number;

    @Column('float')
    minOrderAmount!: number;

    @Column('timestamp', { nullable: true })
    expiresAt?: Date;
}
