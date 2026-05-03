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
    itemId!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column('float')
    price!: number;

    @Column({ nullable: true })
    imageUrl!: string;

    @Column('boolean')
    isAvailable!: boolean;

    @Column('float')
    preparationTime!: number;

    @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category!: CategoryEntity;

    @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurantId' })
    restaurant!: RestaurantEntity;
}
