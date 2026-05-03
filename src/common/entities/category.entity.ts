import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemEntity } from './item.entity';
import { RestaurantEntity } from './restaurant.entity';

@Entity('categories')
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    categoryId!: number;

    @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurantId' })
    restaurant!: RestaurantEntity;

    @Column()
    name!: string;

    @OneToMany(() => ItemEntity, (item) => item.category)
    items!: ItemEntity[];
}
