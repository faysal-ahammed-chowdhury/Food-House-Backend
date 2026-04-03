import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OrderEntity } from 'src/common/entities/order.entity';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { Brackets, Repository } from 'typeorm';
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
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(RestaurantEntity)
        private restaurantRepository: Repository<RestaurantEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}

    /* ========== Common ========== */

    // check user exist or not
    async checkUserExist(email: string): Promise<boolean> {
        const foundEmail = await this.userRepository.findOne({
            where: { email: email },
        });

        return Boolean(foundEmail);
    }

    /* ========== Manage Admin ========== */

    // create an admin
    async createAdmin(createAdminDto: CreateAdminDto): Promise<object> {
        const userExist = await this.checkUserExist(createAdminDto.email);
        if (userExist) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

        const admin = await this.userRepository.save({
            name: createAdminDto.name,
            email: createAdminDto.email,
            password: hashedPassword,
            role: UserRoles.ADMIN,
        });
        const { password, ...adminWithoutPassword } = admin;

        return {
            success: true,
            message: 'Admin Created Successfully',
            data: adminWithoutPassword,
        };
    }

    // get admins
    async getAdmins(search: string): Promise<object> {
        const idSearch = Number(search);

        const qb = this.userRepository
            .createQueryBuilder('user')
            .select(['user.userId', 'user.name', 'user.email'])
            .where('user.role = :role', { role: UserRoles.ADMIN });

        if (search?.trim()) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('user.userId = :id', {
                        id: !isNaN(idSearch) ? idSearch : -1,
                    })
                        .orWhere('user.name ILIKE :search', {
                            search: `%${search.trim()}%`,
                        })
                        .orWhere('user.email ILIKE :search', {
                            search: `%${search.trim()}%`,
                        });
                }),
            );
        }

        const admins = await qb.getMany();

        return {
            success: true,
            message: 'All Admins Fetched',
            data: admins,
        };
    }

    // get admin
    async getAdmin(userId: number): Promise<object> {
        const admin = await this.userRepository.findOne({
            select: ['userId', 'name', 'email', 'role'],
            where: {
                userId: userId,
                role: UserRoles.ADMIN,
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
        const admin = await this.userRepository.findOne({
            where: {
                userId,
                role: UserRoles.ADMIN,
            },
        });

        if (!admin) {
            throw new NotFoundException(`Admin not found with id ${userId}`);
        }

        if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
            const emailTaken = await this.userRepository.findOne({
                where: { email: updateAdminDto.email },
            });
            if (emailTaken) {
                throw new ConflictException('Email already in use');
            }
        }

        if (updateAdminDto.password) {
            const salt = await bcrypt.genSalt();
            updateAdminDto.password = await bcrypt.hash(
                updateAdminDto.password,
                salt,
            );
        }

        admin.name = updateAdminDto.name ?? admin.name;
        admin.email = updateAdminDto.email ?? admin.email;
        admin.password = updateAdminDto.password ?? admin.password;

        const updated = await this.userRepository.save(admin);
        const { password, ...output } = updated;

        return {
            success: true,
            message: `Admin Updated Successfully`,
            data: output,
        };
    }

    // delete admin
    async deleteAdmin(userId: number): Promise<object> {
        const admin = await this.userRepository.findOne({
            where: {
                userId: userId,
                role: UserRoles.ADMIN,
            },
        });

        if (!admin) {
            throw new NotFoundException(`Admin not found with id ${userId}`);
        }

        await this.userRepository.delete(userId);

        return {
            success: true,
            message: `Admin Deleted Successfully`,
        };
    }

    /* ========== Manage Restaurant ========== */

    // create a restaurant
    async createRestaurant(
        createRestaurantDto: CreateRestaurantDto,
    ): Promise<object> {
        const userExist = await this.checkUserExist(createRestaurantDto.email);
        if (userExist) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(
            createRestaurantDto.password,
            salt,
        );

        const restaurant = await this.restaurantRepository.save({
            user: {
                name: createRestaurantDto.name,
                email: createRestaurantDto.email,
                password: hashedPassword,
                role: UserRoles.RESTAURANT,
            },

            description: createRestaurantDto.description,
            address: createRestaurantDto.address,
            isOpen: createRestaurantDto.isOpen,
            currentCommissionPercent:
                createRestaurantDto.currentCommissionPercent,
            currentDeliveryFee: createRestaurantDto.currentDeliveryFee,
            bkashAccount: createRestaurantDto.bkashAccount,
            bankAccount: createRestaurantDto.bankAccount,
        });

        const { password, ...userWithoutPassword } = restaurant.user;
        const output = { ...restaurant, user: userWithoutPassword };

        return {
            success: true,
            message: `Restaurant ${restaurant.user.name} created successfully`,
            data: output,
        };
    }

    // get restaurants
    async getRestaurants(search: string): Promise<object> {
        const idSearch = Number(search);

        const qb = this.restaurantRepository
            .createQueryBuilder('restaurant')
            .innerJoin('restaurant.user', 'user')
            .select([
                'restaurant.restaurantId',
                'restaurant.address',
                'restaurant.description',
                'restaurant.isOpen',
                'restaurant.currentCommissionPercent',
                'restaurant.currentDeliveryFee',
                'user.userId',
                'user.name',
                'user.email',
            ]);

        if (search?.trim()) {
            qb.where(
                'restaurant.restaurantId = :id OR user.name ILIKE :search OR user.email ILIKE :search OR restaurant.address ILIKE :search',
                {
                    id: !isNaN(idSearch) ? idSearch : -1,
                    search: `%${search.trim()}%`,
                },
            );
        }

        const restaurants = await qb.getMany();

        return {
            success: true,
            message: 'Restaurants Fetched',
            data: restaurants,
        };
    }

    // get restaurant
    async getRestaurant(restaurantId: number): Promise<object> {
        const restaurant = await this.restaurantRepository.findOne({
            relations: {
                user: true,
            },
            where: {
                restaurantId: restaurantId,
            },
        });

        if (!restaurant) {
            throw new NotFoundException(
                `Restaurant not found with ID: ${restaurantId}`,
            );
        }

        const { password, ...userWithoutPassword } = restaurant.user;
        const output = { ...restaurant, user: userWithoutPassword };

        return {
            success: true,
            message: 'Restaurant Fetched',
            data: output,
        };
    }

    // update restaurant
    async updateRestaurant(
        restaurantId: number,
        updateRestaurantDto: UpdateRestaurantDto,
    ): Promise<object> {
        const restaurant = await this.restaurantRepository.findOne({
            relations: ['user'],
            where: { restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundException(
                `Restaurant not found with id ${restaurantId}`,
            );
        }

        if (
            updateRestaurantDto.email &&
            updateRestaurantDto.email !== restaurant.user.email
        ) {
            const emailTaken = await this.userRepository.findOne({
                where: { email: updateRestaurantDto.email },
            });
            if (emailTaken) {
                throw new ConflictException('Email already in use');
            }
        }

        if (updateRestaurantDto.password) {
            const salt = await bcrypt.genSalt();
            updateRestaurantDto.password = await bcrypt.hash(
                updateRestaurantDto.password,
                salt,
            );
        }

        restaurant.user.name = updateRestaurantDto.name ?? restaurant.user.name;
        restaurant.user.email =
            updateRestaurantDto.email ?? restaurant.user.email;
        restaurant.user.password =
            updateRestaurantDto.password ?? restaurant.user.password;

        restaurant.description =
            updateRestaurantDto.description ?? restaurant.description;
        restaurant.address = updateRestaurantDto.address ?? restaurant.address;
        restaurant.isOpen = updateRestaurantDto.isOpen ?? restaurant.isOpen;
        restaurant.currentCommissionPercent =
            updateRestaurantDto.currentCommissionPercent ??
            restaurant.currentCommissionPercent;
        restaurant.currentDeliveryFee =
            updateRestaurantDto.currentDeliveryFee ??
            restaurant.currentDeliveryFee;
        restaurant.bkashAccount =
            updateRestaurantDto.bkashAccount ?? restaurant.bkashAccount;
        restaurant.bankAccount =
            updateRestaurantDto.bankAccount ?? restaurant.bankAccount;

        const updated = await this.restaurantRepository.save(restaurant);

        const { password, ...userWithoutPassword } = updated.user;
        const output = { ...updated, user: userWithoutPassword };

        return {
            success: true,
            message: `Restaurant Updated Successfully`,
            data: output,
        };
    }

    // delete restaurant
    async deleteRestaurant(restaurantId: number): Promise<object> {
        const restaurant = await this.restaurantRepository.findOne({
            relations: ['user'],
            where: {
                restaurantId: restaurantId,
            },
        });

        if (!restaurant) {
            throw new NotFoundException(
                `Restaurant not found with id ${restaurantId}`,
            );
        }

        await this.userRepository.delete(restaurant.user.userId);

        return {
            success: true,
            message: `Restaurant Deleted Successfully`,
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
