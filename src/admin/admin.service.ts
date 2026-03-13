import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Injectable()
export class AdminService {
    /* ========== Manage Restaurant ========== */

    // create a restaurant
    createRestaurant(createRestaurantDto: CreateRestaurantDto): object {
        return {
            success: true,
            message: 'Rider Created Successfully',
            data: {
                userId: 101,
                restaurantId: 101,
                ...createRestaurantDto,
            },
        };
    }

    // get all restaurants
    getAllRestaurants(): object {
        return {
            success: true,
            message: 'Restaurant Fetched',
            data: [
                {
                    userId: 101,
                    restaurantId: 101,
                },
            ],
        };
    }

    // filter restaurants
    filterRestaurants(search: string, filter: string): object {
        return {
            success: true,
            message: 'Restaurant Fetched',
            data: [
                {
                    userId: search,
                    restaurantId: filter,
                },
            ],
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

    // return all rider
    getAllRiders(): object {
        return {
            success: true,
            message: 'Rider Fetched',
            data: [
                {
                    userId: 101,
                    riderId: 101,
                },
            ],
        };
    }

    // filter riders
    filterRiders(search: string, filter: string): object {
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
}
