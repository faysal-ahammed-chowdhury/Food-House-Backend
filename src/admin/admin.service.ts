import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CategoryEntity } from 'src/common/entities/category.entity';
import { CustomerEntity } from 'src/common/entities/customer.entity';
import { ItemEntity } from 'src/common/entities/item.entity';
import { OrderEntity } from 'src/common/entities/order.entity';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { RiderEntity } from 'src/common/entities/rider.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { Brackets, Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
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
        @InjectRepository(RiderEntity)
        private riderRepository: Repository<RiderEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(ItemEntity)
        private itemRepository: Repository<ItemEntity>,
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
    ) {}

    /* ========== Common ========== */

    // check email exist or not
    async checkEmailExist(email: string): Promise<boolean> {
        const foundEmail = await this.userRepository.findOne({
            where: { email: email },
        });

        return Boolean(foundEmail);
    }

    /* ========== Manage Admin ========== */

    // create an admin
    async createAdmin(createAdminDto: CreateAdminDto): Promise<object> {
        const emailExist = await this.checkEmailExist(createAdminDto.email);
        if (emailExist) {
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
        const emailExist = await this.checkEmailExist(
            createRestaurantDto.email,
        );
        if (emailExist) {
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

    // get restaurant items
    async getRestaurantItems(
        restaurantId: number,
        search: string,
        categoryName: string,
    ): Promise<object> {
        const qb = this.itemRepository
            .createQueryBuilder('item')
            .innerJoin('item.category', 'category')
            .select([
                'item.itemId',
                'item.name',
                'item.description',
                'item.price',
                'item.imageUrl',
                'item.isAvailable',
                'item.preparationTime',
                'category.categoryId',
                'category.name',
            ])
            .where('item.restaurantId = :restaurantId', { restaurantId });

        if (search?.trim()) {
            qb.andWhere('item.name ILIKE :search', {
                search: `%${search.trim()}%`,
            });
        }

        if (categoryName?.trim()) {
            qb.andWhere('category.name ILIKE :categoryName', {
                categoryName: `%${categoryName.trim()}%`,
            });
        }

        const items = await qb.getMany();

        return {
            success: true,
            message: 'Items Fetched Successfully',
            data: items,
        };
    }

    // add new item
    async addNewItem(
        restaurantId: number,
        createItemDto: CreateItemDto,
    ): Promise<object> {
        const { categoryId, ...rest } = createItemDto;

        const category = await this.categoryRepository.findOne({
            where: { categoryId, restaurant: { restaurantId } },
        });
        if (!category) {
            throw new NotFoundException(
                'Category not found or does not belong to this restaurant',
            );
        }

        const item = await this.itemRepository.save({
            ...rest,
            isAvailable: true,
            restaurant: { restaurantId },
            category: { categoryId },
        });

        return {
            success: true,
            message: 'Item Added Successfully',
            data: item,
        };
    }

    // update item
    async updateItem(
        itemId: number,
        updateItemDto: UpdateItemDto,
    ): Promise<object> {
        const item = await this.itemRepository.findOneBy({ itemId: itemId });

        if (!item) {
            throw new NotFoundException('Item Not Found');
        }

        item.name = updateItemDto.name ?? item.name;
        item.description = updateItemDto.description ?? item.description;
        item.price = updateItemDto.price ?? item.price;
        item.imageUrl = updateItemDto.imageUrl ?? item.imageUrl;
        item.preparationTime =
            updateItemDto.preparationTime ?? item.preparationTime;
        item.isAvailable = updateItemDto.isAvailable ?? item.isAvailable;

        const output = await this.itemRepository.save(item);

        return {
            success: true,
            message: 'Item Updated Successfully',
            data: output,
        };
    }

    // set item availability
    async setItemAvailability(
        itemId: number,
        isAvailable: boolean,
    ): Promise<object> {
        const item = await this.itemRepository.findOneBy({ itemId: itemId });

        if (!item) {
            throw new NotFoundException('Item Not Found');
        }
        item.isAvailable = isAvailable;
        const output = await this.itemRepository.save(item);

        return {
            success: true,
            message: 'Item Availability Updated Successfully',
            data: output,
        };
    }

    // delete item
    async deleteItem(itemId: number): Promise<object> {
        const item = await this.itemRepository.findOneBy({ itemId: itemId });

        if (!item) {
            throw new NotFoundException('Item Not Found');
        }

        await this.itemRepository.delete(itemId);

        return {
            success: true,
            message: 'Item Deleted Successfully',
        };
    }

    // add new category
    async addNewCategory(
        restaurantId: number,
        createCategoryDto: CreateCategoryDto,
    ): Promise<object> {
        const restaurantExist = await this.restaurantRepository.findOne({
            where: {
                restaurantId: restaurantId,
            },
        });

        if (!restaurantExist) {
            throw new NotFoundException('Restaurant Not Found');
        }

        const categoryNameExist = await this.categoryRepository.findOne({
            where: {
                name: createCategoryDto.name,
                restaurant: {
                    restaurantId: restaurantId,
                },
            },
        });

        if (categoryNameExist) {
            throw new ConflictException(
                'Category already exist to the Restaurant',
            );
        }

        const output = await this.categoryRepository.save({
            ...createCategoryDto,
            restaurant: { restaurantId },
        });

        return {
            success: true,
            message: 'Category Added Successfully',
            data: output,
        };
    }

    // update category
    async updateCategory(
        categoryId: number,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<object> {
        const category = await this.categoryRepository.findOneBy({
            categoryId: categoryId,
        });

        if (!category) {
            throw new NotFoundException('Category Not Found');
        }

        category.name = updateCategoryDto.name ?? category.name;
        const output = await this.categoryRepository.save(category);

        return {
            success: true,
            message: 'Category Updated Successfully',
            data: output,
        };
    }

    // delete category
    async deleteCategory(categoryId: number): Promise<object> {
        const category = await this.categoryRepository.findOneBy({
            categoryId: categoryId,
        });

        if (!category) {
            throw new NotFoundException('Category Not Found');
        }

        await this.categoryRepository.delete(categoryId);

        return {
            success: true,
            message: 'Category Deleted Successfully',
        };
    }

    /* ========== Manage Customer ========== */

    // create a customer
    async createCustomer(
        createCustomerDto: CreateCustomerDto,
    ): Promise<object> {
        const emailExist = await this.checkEmailExist(createCustomerDto.email);
        if (emailExist) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(
            createCustomerDto.password,
            salt,
        );

        const customer = await this.customerRepository.save({
            user: {
                name: createCustomerDto.name,
                email: createCustomerDto.email,
                password: hashedPassword,
                role: UserRoles.CUSTOMER,
            },

            address: createCustomerDto.address,
            phone: createCustomerDto.phone,
        });

        const { password, ...userWithoutPassword } = customer.user;
        const output = { ...customer, user: userWithoutPassword };

        return {
            success: true,
            message: `Customer ${output.user.name} created successfully`,
            data: output,
        };
    }

    // get customers
    async getCustomers(search: string, sortby: string): Promise<object> {
        const idSearch = Number(search?.trim());

        const query = this.customerRepository
            .createQueryBuilder('customer')
            .innerJoin('customer.user', 'user')
            .loadRelationCountAndMap('customer.orderCount', 'customer.orders')
            .select([
                'customer.customerId',
                'customer.address',
                'customer.phone',
                'user.userId',
                'user.name',
                'user.email',
            ]);

        if (search?.trim()) {
            query.where(
                'user.name ILIKE :search OR user.email ILIKE :search OR customer.phone ILIKE :search OR (:idSearch > 0 AND customer.customerId = :idSearch)',
                {
                    search: `%${search.trim()}%`,
                    idSearch: isNaN(idSearch) ? 0 : idSearch,
                },
            );
        }

        if (sortby === 'less_orders' || sortby === 'most_orders') {
            query
                .addSelect(
                    (qb) =>
                        qb
                            .select('COUNT(o.orderId)', 'orderCount')
                            .from('orders', 'o')
                            .where('o.customerId = customer.customerId'),
                    'orderCount',
                )
                .orderBy(
                    'orderCount',
                    sortby === 'most_orders' ? 'DESC' : 'ASC',
                );
        }

        const customers = await query.getMany();

        return {
            success: true,
            message: 'Customers Fetched Successfully',
            data: customers,
        };
    }

    // update customer
    async updateCustomer(
        customerId: number,
        updateCustomerDto: UpdateCustomerDto,
    ): Promise<object> {
        const customer = await this.customerRepository.findOne({
            relations: ['user'],
            where: { customerId },
        });

        if (!customer) {
            throw new NotFoundException(
                `Customer not found with id ${customerId}`,
            );
        }

        if (
            updateCustomerDto.email &&
            updateCustomerDto.email !== customer.user.email
        ) {
            const emailTaken = await this.userRepository.findOne({
                where: { email: updateCustomerDto.email },
            });
            if (emailTaken) {
                throw new ConflictException('Email already in use');
            }
        }

        if (updateCustomerDto.password) {
            const salt = await bcrypt.genSalt();
            updateCustomerDto.password = await bcrypt.hash(
                updateCustomerDto.password,
                salt,
            );
        }

        customer.user.name = updateCustomerDto.name ?? customer.user.name;
        customer.user.email = updateCustomerDto.email ?? customer.user.email;
        customer.user.password =
            updateCustomerDto.password ?? customer.user.password;
        customer.address = updateCustomerDto.address ?? customer.address;
        customer.phone = updateCustomerDto.phone ?? customer.phone;

        const updated = await this.customerRepository.save(customer);

        const { password, ...userWithoutPassword } = updated.user;
        const output = { ...updated, user: userWithoutPassword };

        return {
            success: true,
            message: `Customer Updated Successfully`,
            data: output,
        };
    }

    // delete customer
    async deleteCustomer(customerId: number): Promise<object> {
        const customer = await this.customerRepository.findOne({
            relations: ['user'],
            where: {
                customerId: customerId,
            },
        });

        if (!customer) {
            throw new NotFoundException(
                `Customer not found with id ${customerId}`,
            );
        }

        await this.userRepository.delete(customer.user.userId);

        return {
            success: true,
            message: `Customer Deleted Successfully`,
        };
    }

    /* ========== Manage Rider ========== */

    // create a rider
    async createRider(
        createRiderDto: CreateRiderDto,
        nidImageUrl: string,
    ): Promise<object> {
        const emailExist = await this.checkEmailExist(createRiderDto.email);
        if (emailExist) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createRiderDto.password, salt);

        const rider = await this.riderRepository.save({
            user: {
                name: createRiderDto.name,
                email: createRiderDto.email,
                password: hashedPassword,
                role: UserRoles.RIDER,
            },

            phone: createRiderDto.phone,
            riderNid: createRiderDto.riderNid,
            nidImageUrl: nidImageUrl,
            isOnline: false,
            bkashAccount: createRiderDto.bkashAccount,
            bankAccount: createRiderDto.bankAccount,
        });

        const { password, ...userWithoutPassword } = rider.user;
        const output = { ...rider, user: userWithoutPassword };

        return {
            success: true,
            message: `Rider ${output.user.name} created successfully`,
            data: output,
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

    // update rider
    async updateRider(
        riderId: number,
        updateRiderDto: UpdateRiderDto,
    ): Promise<object> {
        const rider = await this.riderRepository.findOne({
            relations: ['user'],
            where: { riderId },
        });

        if (!rider) {
            throw new NotFoundException(`Rider not found with id ${riderId}`);
        }

        if (updateRiderDto.email && updateRiderDto.email !== rider.user.email) {
            const emailTaken = await this.userRepository.findOne({
                where: { email: updateRiderDto.email },
            });
            if (emailTaken) {
                throw new ConflictException('Email already in use');
            }
        }

        if (updateRiderDto.password) {
            const salt = await bcrypt.genSalt();
            updateRiderDto.password = await bcrypt.hash(
                updateRiderDto.password,
                salt,
            );
        }

        rider.user.name = updateRiderDto.name ?? rider.user.name;
        rider.user.email = updateRiderDto.email ?? rider.user.email;
        rider.user.password = updateRiderDto.password ?? rider.user.password;

        rider.phone = updateRiderDto.phone ?? rider.phone;
        rider.isOnline = updateRiderDto.isOnline ?? rider.isOnline;
        rider.bkashAccount = updateRiderDto.bkashAccount ?? rider.bkashAccount;
        rider.bankAccount = updateRiderDto.bankAccount ?? rider.bankAccount;

        const updated = await this.riderRepository.save(rider);

        const { password, ...userWithoutPassword } = updated.user;
        const output = { ...updated, user: userWithoutPassword };

        return {
            success: true,
            message: `Rider Updated Successfully`,
            data: output,
        };
    }

    // delete rider
    async deleteRider(riderId: number): Promise<object> {
        const rider = await this.riderRepository.findOne({
            relations: ['user'],
            where: {
                riderId: riderId,
            },
        });

        if (!rider) {
            throw new NotFoundException(`Rider not found with id ${riderId}`);
        }

        await this.userRepository.delete(rider.user.userId);

        return {
            success: true,
            message: `Rider Deleted Successfully`,
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
