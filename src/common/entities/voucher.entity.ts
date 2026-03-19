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
    voucherId: number;

    @ManyToOne(() => RestaurantEntity, {
        cascade: true,
    })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: RestaurantEntity;

    @Column()
    voucherCode: string;

    @Column('decimal')
    percent: number;

    @Column('decimal')
    maxDiscount: number;

    @Column('decimal')
    minOrderAmount: number;
}
