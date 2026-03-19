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
    categoryId: number;

    @ManyToOne(() => RestaurantEntity, {
        cascade: true,
    })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: RestaurantEntity;

    @Column()
    name: string;

    @Column('boolean')
    isAvailable: boolean;

    @OneToMany(() => ItemEntity, (item) => item.category)
    items: ItemEntity[];
}
