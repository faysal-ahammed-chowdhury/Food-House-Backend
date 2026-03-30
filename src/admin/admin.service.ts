import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { Like, Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(RestaurantEntity)
        private restaurantRepository: Repository<RestaurantEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    /* ========== Manage Admin ========== */

    // create an admin
    async createAdmin(createAdminDto: CreateAdminDto): Promise<object> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

        const foundEmail = await this.userRepository.findOne({
            where: { email: createAdminDto.email },
        });

        if (foundEmail) {
            throw new BadRequestException('Email already exists');
        }

        const admin = await this.userRepository.save({
            name: createAdminDto.name,
            email: createAdminDto.email,
            password: hashedPassword,
            role: UserRoles.ADMIN,
        });
        const { password, ...result } = admin;

        return {
            success: true,
            message: 'Admin Created Successfully',
            data: result,
        };
    }

    // get admins
    async getAdmins(search: string): Promise<object> {
        const idSearch = Number(search);
        const conditions: any[] = [];
        if (!isNaN(idSearch)) {
            conditions.push({ userId: idSearch });
        }

        if (search) {
            conditions.push({ name: Like(`%${search}%`) });
            conditions.push({ email: Like(`%${search}%`) });
        }

        const admins = await this.userRepository.find({
            select: ['userId', 'name', 'email'],
            where: conditions.length ? conditions : {},
        });

        return {
            success: true,
            message: 'All Admin Provided',
            data: admins,
        };
    }

    // get admin
    async getAdmin(userId: number): Promise<object> {
        const admin = await this.userRepository.findOne({
            select: ['userId', 'name', 'email', 'role'],
            where: {
                userId: userId,
            },
        });

        if (!admin) {
            throw new NotFoundException(`Admin not found with id ${userId}`);
        }

        return {
            success: true,
            message: 'Admin Found',
            data: admin,
        };
    }

    // update admin
    async updateAdmin(
        userId: number,
        updateAdminDto: UpdateAdminDto,
    ): Promise<object> {
        let admin = await this.userRepository.findOne({
            select: ['userId', 'name', 'email', 'role'],
            where: {
                userId: userId,
            },
        });

        if (!admin) {
            throw new NotFoundException(`Admin not found with id ${userId}`);
        }

        if (admin.role !== UserRoles.ADMIN) {
            throw new BadRequestException(`User ID: ${userId} is not an admin`);
        }

        await this.userRepository.update(userId, updateAdminDto);
        admin = await this.userRepository.findOne({
            select: ['userId', 'name', 'email', 'role'],
            where: {
                userId: userId,
            },
        });

        return {
            success: true,
            message: 'Admin Updated Successfully',
            data: admin,
        };
    }

    // delete admin
    async deleteAdmin(userId: number): Promise<object> {
        const admin = await this.userRepository.findOne({
            select: ['userId', 'name', 'email', 'role'],
            where: {
                userId: userId,
            },
        });

        if (!admin) {
            throw new NotFoundException(`Admin not found with id ${userId}`);
        }

        if (admin.role !== UserRoles.ADMIN) {
            throw new BadRequestException(`User ID: ${userId} is not an admin`);
        }

        await this.userRepository.delete(userId);

        return {
            success: true,
            message: `User ID: ${userId} Deleted Successfully`,
        };
    }

    /* ========== Manage Restaurant ========== */

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
