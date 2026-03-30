import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Injectable()
export class AdminService {
    /* ========== Manage Admin ========== */

    /* ========== Manage Restaurant ========== */

    constructor(
        @InjectRepository(RestaurantEntity)
        private restaurantRepository: Repository<RestaurantEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    // create a restaurant
    createRestaurant(createRestaurantDto: CreateRestaurantDto): object {
        return {
            success: true,
            message: 'Restaurants Created',
            createRestaurantDto,
        };
    }

    // get restaurants
    getRestaurants(search: string, filter: string): object {
        return {
            success: true,
            message: 'Restaurants Fetched',
            search,
            filter,
        };
    }

    // get restaurant
    getRestaurant(restaurantId: number): object {
        return {
            success: true,
            message: 'Restaurant Fetched',
            data: {
                restaurantId: restaurantId,
            },
        };
    }

    // update restaurant
    updateRestaurant(
        restaurantId: number,
        updateRestaurantDto: UpdateRestaurantDto,
    ): object {
        return {
            success: true,
            message: 'Restaurant Updated Successfully',
            data: {
                userId: 101,
                restaurantId,
                ...updateRestaurantDto,
            },
        };
    }

    // delete restaurant
    deleteRestaurant(restaurantId: number): object {
        return {
            success: true,
            message: 'Restaurant Deleted Successfully',
            data: {
                restaurantId,
            },
        };
    }

    /* ========== Manage Menu ========== */

    // get restaurant menu
    getRestaurantMenu(restaurantId: number, search: string, filter: string) {
        return {
            success: true,
            message: 'Menu Fetched Successfully',
            data: {
                restaurantId,
                search,
                filter,
            },
        };
    }

    // add new item
    addNewItem(restaurantId: number, createItemDto: CreateItemDto) {
        return {
            success: true,
            message: 'Item Added Successfully',
            data: {
                restaurantId,
                createItemDto,
            },
        };
    }

    // update item
    updateItem(itemId: number, updateItemDto: UpdateItemDto) {
        return {
            success: true,
            message: 'Item Updated Successfully',
            data: {
                itemId,
                updateItemDto,
            },
        };
    }

    // set item availability
    setItemAvailability(itemId: number, isAvailable: boolean) {
        return {
            success: true,
            message: 'Item dummu Successfully',
            data: {
                itemId,
                isAvailable,
            },
        };
    }

    // delete item
    deleteItem(itemId: number) {
        return {
            success: true,
            message: 'Item Deleted Successfully',
            data: {
                itemId,
            },
        };
    }

    // add new category
    addNewCategory(restaurantId: number, createCategoryDto: CreateCategoryDto) {
        return {
            success: true,
            message: 'Category Added Successfully',
            data: {
                restaurantId,
                createCategoryDto,
            },
        };
    }

    // update category
    updateCategory(categoryId: number, updateCategoryDto: UpdateCategoryDto) {
        return {
            success: true,
            message: 'Category Updated Successfully',
            data: {
                categoryId,
                updateCategoryDto,
            },
        };
    }

    // delete category
    deleteCategory(categoryId: number) {
        return {
            success: true,
            message: 'Category Deleted Successfully',
            data: {
                categoryId,
            },
        };
    }

    /* ========== Manage Rider ========== */

    // create a rider
    createRider(createRiderDto: CreateRiderDto): object {
        return {
            success: true,
            message: 'Rider Created Successfully',
            data: {
                userId: 101,
                riderId: 101,
                ...createRiderDto,
            },
        };
    }

    // get riders
    getRiders(search: string, filter: string): object {
        return {
            success: true,
            message: 'Rider Fetched',
            data: [
                {
                    userId: search,
                    riderId: filter,
                },
            ],
        };
    }

    // get rider
    getRider(riderId: number): object {
        return {
            success: true,
            message: 'Rider Fetched',
            data: {
                riderId: riderId,
            },
        };
    }

    // update rider
    updateRider(riderId: number, updateRiderDto: UpdateRiderDto): object {
        return {
            success: true,
            message: 'Rider Updated Successfully',
            data: {
                userId: 101,
                riderId,
                ...updateRiderDto,
            },
        };
    }

    // delete rider
    deleteRider(riderId: number): object {
        return {
            success: true,
            message: 'Rider Deleted Successfully',
            data: {
                riderId,
            },
        };
    }

    /* ========== Manage Order ========== */

    // get all order
    getOrders(
        search: string,
        status: OrderStatus,
        dateFrom: string,
        dateTo: string,
        paymentMethod: PaymentMethod,
        restaurantId: number,
        riderId: number,
    ) {
        return {
            success: true,
            message: 'Dummy Successfully',
            data: {
                search,
                status,
                dateFrom,
                dateTo,
                paymentMethod,
                restaurantId,
                riderId,
            },
        };
    }

    // get order
    getOrder(orderId: number) {
        return {
            success: true,
            message: 'Dummy Successfully',
            data: {
                orderId,
            },
        };
    }

    // get order
    cancelOrder(orderId: number) {
        return {
            success: true,
            message: 'Dummy Successfully',
            data: {
                orderId,
            },
        };
    }
}
