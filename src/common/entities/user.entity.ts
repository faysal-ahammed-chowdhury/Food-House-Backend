import { UserRoles } from 'src/common/enums/user-roles.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    userId!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ type: 'enum', enum: UserRoles })
    role!: UserRoles;

    @Column({ type: 'boolean', default: false })
    isVerified!: boolean;

    @Column({ type: 'varchar', nullable: true })
    verificationToken!: string | null;

    // @OneToOne(() => RestaurantEntity, (restaurant) => restaurant.user)
    // restaurant: RestaurantEntity;

    // @OneToOne(() => CustomerEntity, (customer) => customer.user)
    // customer: CustomerEntity;

    // @OneToOne(() => RiderEntity, (rider) => rider.user) rider: RiderEntity;
}
