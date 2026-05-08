import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

@Entity('customers')
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    customerId!: number;

    @OneToOne(() => UserEntity, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column()
    address!: string;

    @Column()
    phone!: string;

    @OneToMany(() => OrderEntity, (order) => order.customer)
    orders!: OrderEntity[];
}
