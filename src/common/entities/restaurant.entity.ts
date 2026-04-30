import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { ItemEntity } from './item.entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';
import { VoucherEntity } from './voucher.entity';

@Entity('restaurants')
export class RestaurantEntity {
    @PrimaryGeneratedColumn()
    restaurantId: number;

    @OneToOne(() => UserEntity, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    bannerUrl?: string;

    @Column()
    address: string;

    @Column('boolean')
    isOpen: boolean;

    @Column('float')
    currentCommissionPercent: number;

    @Column('float')
    currentDeliveryFee: number;

    @Column({ nullable: true })
    bkashAccount?: string;

    @Column({ nullable: true })
    bankAccount?: string;

    @OneToMany(() => CategoryEntity, (category) => category.restaurant)
    categories: CategoryEntity[];

    @OneToMany(() => ItemEntity, (item) => item.restaurant)
    items: ItemEntity[];

    @OneToMany(() => VoucherEntity, (voucher) => voucher.restaurant)
    vouchers: VoucherEntity[];

    @OneToMany(() => OrderEntity, (order) => order.restaurant)
    orders: OrderEntity[];
}
