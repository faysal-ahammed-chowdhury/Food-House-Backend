import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { RestaurantEntity } from './restaurant.entity';

@Entity('items')
export class ItemEntity {
    @PrimaryGeneratedColumn()
    itemId: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('decimal')
    price: number;

    @Column({ nullable: true })
    imageUrl: string;

    @Column('boolean')
    isAvailable: boolean;

    @Column('decimal')
    preparationTime: number;

    @ManyToOne(() => CategoryEntity, {
        cascade: true,
    })
    @JoinColumn({ name: 'categoryId' })
    category: CategoryEntity;

    @ManyToOne(() => RestaurantEntity, { cascade: true })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: RestaurantEntity;
}
