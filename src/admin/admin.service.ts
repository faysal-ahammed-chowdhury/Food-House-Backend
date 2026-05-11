import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
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
import { UserRoles } from 'src/common/enums/user-roles.enum';
import {
    Between,
    ILike,
    LessThanOrEqual,
    MoreThanOrEqual,
    Repository,
} from 'typeorm';
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

    /* ========== Dashboard APIs ========== */

    // get stats
    async getStats(): Promise<object> {
        const orders = await this.orderRepository.find({
            where: { status: OrderStatus.DELIVERED },
        });

        const platformEarnings = orders.reduce((prev, cur) => {
            return prev + cur.commissionAmount;
        }, 0);

        const totalOrders = orders.length;

        const restaurants = await this.restaurantRepository.find();
        const totalRestaurant = restaurants.length;

        const rider = await this.riderRepository.find();
        const totalRider = rider.length;
        return {
            success: true,
            message: 'Stats Fetched Successfully',
            data: {
                platformEarnings,
                totalOrders,
                totalRestaurant,
                totalRider,
            },
        };
    }

    // get recent orders
    async getRecentOrders(): Promise<object> {
        const data = await this.orderRepository.find({
            order: { orderAt: 'DESC' },
            take: 7,
        });

        return {
            success: true,
            message: 'Stats Fetched Successfully',
            data,
        };
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
            isVerified: true,
        });
        const { password, verificationToken, ...adminWithoutPassword } = admin;

        return {
            success: true,
            message: 'Admin Created Successfully',
            data: adminWithoutPassword,
        };
    }

    // get admins
    async getAdmins(search?: string): Promise<object> {
        search = search?.trim();

        const isNumeric = !isNaN(Number(search));

        const admins = await this.userRepository.find({
            select: ['userId', 'email', 'name', 'role'],
            where: search
                ? [
                      { role: UserRoles.ADMIN, name: ILike(`%${search}%`) },
                      { role: UserRoles.ADMIN, email: ILike(`%${search}%`) },
                      ...(isNumeric
                          ? [{ role: UserRoles.ADMIN, userId: Number(search) }]
                          : []),
                  ]
                : { role: UserRoles.ADMIN },
            order: {
                userId: 'ASC',
            },
        });

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

        if (updateAdminDto.password) {
            const salt = await bcrypt.genSalt();
            updateAdminDto.password = await bcrypt.hash(
                updateAdminDto.password,
                salt,
            );
        }

        admin.email = updateAdminDto?.email ?? admin.email;
        admin.name = updateAdminDto.name ?? admin.name;
        admin.password = updateAdminDto.password ?? admin.password;

        const newEmailUser = await this.userRepository.findOne({
            where: {
                email: admin.email,
            },
            select: {
                userId: true,
            },
        });
        if (newEmailUser && newEmailUser.userId !== admin.userId) {
            throw new ConflictException('Email already exists');
        }

        const updated = await this.userRepository.save(admin);
        const { password, verificationToken, ...output } = updated;

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
                isVerified: true,
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

        const { password, verificationToken, ...userWithoutPassword } =
            restaurant.user;
        const output = { ...restaurant, user: userWithoutPassword };

        return {
            success: true,
            message: `Restaurant ${restaurant.user.name} created successfully`,
            data: output,
        };
    }

    // get restaurants
    async getRestaurants(search?: string): Promise<object> {
        search = search?.trim();

        const isNumeric = !isNaN(Number(search));

        const restaurants = await this.restaurantRepository.find({
            select: {
                restaurantId: true,
                user: {
                    userId: true,
                    name: true,
                    email: true,
                },
                address: true,
                description: true,
                currentCommissionPercent: true,
                currentDeliveryFee: true,
                bkashAccount: true,
                bankAccount: true,
                isOpen: true,
                orders: {
                    total: true,
                    commissionAmount: true,
                    deliveryFee: true,
                    status: true,
                },
            },
            relations: ['user', 'orders'],
            ...(search
                ? {
                      where: [
                          { user: { name: ILike(`%${search}%`) } },
                          { user: { email: ILike(`%${search}%`) } },
                          ...(isNumeric
                              ? [{ restaurantId: Number(search) }]
                              : [{}]),
                      ],
                  }
                : {}),

            order: {
                restaurantId: 'ASC',
            },
        });

        const output = restaurants.map((restaurant) => {
            const totalEarning: number = restaurant.orders.reduce(
                (total, cur) => {
                    return (
                        total +
                        (cur.status === OrderStatus.DELIVERED
                            ? cur.total - cur.commissionAmount - cur.deliveryFee
                            : 0)
                    );
                },
                0,
            );

            const { orders, ...restaurantWithoutOrders } = restaurant;

            return {
                ...restaurantWithoutOrders,
                totalEarning,
            };
        });

        return {
            success: true,
            message: 'Restaurants Fetched',
            data: output,
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

        const { password, verificationToken, ...userWithoutPassword } =
            restaurant.user;
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

        const newEmailUser = await this.userRepository.findOne({
            where: {
                email: restaurant.user.email,
            },
            select: {
                userId: true,
            },
        });
        if (newEmailUser && newEmailUser.userId !== restaurant.user.userId) {
            throw new ConflictException('Email already exists');
        }

        const updated = await this.restaurantRepository.save(restaurant);

        const { password, verificationToken, ...userWithoutPassword } =
            updated.user;
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
        search?: string,
        categoryName?: string,
    ): Promise<object> {
        const restaurant = await this.restaurantRepository.findOneBy({
            restaurantId: restaurantId,
        });

        if (!restaurant) {
            throw new NotFoundException('Restaurant Not Exists');
        }

        search = search?.trim();
        categoryName = categoryName?.trim();

        const items = await this.itemRepository.find({
            select: {
                itemId: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                preparationTime: true,
                category: {
                    categoryId: true,
                    name: true,
                },
            },
            relations: ['category'],
            where: {
                restaurant: {
                    restaurantId: restaurantId,
                },
                ...(search ? { name: ILike(`%${search}%`) } : {}),
                ...(categoryName
                    ? {
                          category: {
                              name: ILike(`%${categoryName}%`),
                          },
                      }
                    : {}),
            },
        });

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
            throw new NotFoundException('Item Not Exists');
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

    // get restaurant categories
    async getRestaurantCategories(
        restaurantId: number,
        search?: string,
    ): Promise<object> {
        const restaurant = await this.restaurantRepository.findOneBy({
            restaurantId: restaurantId,
        });

        if (!restaurant) {
            throw new NotFoundException('Restaurant Not Exists');
        }
        search = search?.trim();

        const categories = await this.categoryRepository.find({
            select: {
                categoryId: true,
                name: true,
            },
            relations: ['items'],
            where: {
                restaurant: {
                    restaurantId: restaurantId,
                },
                ...(search ? { name: ILike(`%${search}%`) } : {}),
            },
        });

        const output = categories.map((category) => {
            const count = category.items.length;
            const { items, ...categoryWithoutItems } = category;
            return {
                ...categoryWithoutItems,
                itemsCount: count,
            };
        });

        return {
            success: true,
            message: 'Categories Fetched Successfully',
            data: output,
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
        const category = await this.categoryRepository.findOne({
            relations: ['restaurant'],
            where: {
                categoryId: categoryId,
            },
        });

        if (!category) {
            throw new NotFoundException('Category Not Found');
        }

        if (updateCategoryDto.name) {
            const categoryNameExist = await this.categoryRepository.findOne({
                where: {
                    name: updateCategoryDto.name,
                    restaurant: {
                        restaurantId: category.restaurant.restaurantId,
                    },
                },
            });

            if (
                categoryNameExist &&
                categoryNameExist.categoryId !== categoryId
            ) {
                throw new ConflictException(
                    'Category already exist to the Restaurant',
                );
            }
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
                isVerified: true,
            },

            address: createCustomerDto.address,
            phone: createCustomerDto.phone,
        });

        const { password, verificationToken, ...userWithoutPassword } =
            customer.user;
        const output = { ...customer, user: userWithoutPassword };

        return {
            success: true,
            message: `Customer ${output.user.name} created successfully`,
            data: output,
        };
    }

    // get customers
    async getCustomers(search?: string): Promise<object> {
        search = search?.trim();

        const isNumeric = !isNaN(Number(search));

        const customers = await this.customerRepository.find({
            select: {
                customerId: true,
                user: {
                    userId: true,
                    name: true,
                    email: true,
                    isVerified: true,
                },
                address: true,
                phone: true,
                orders: {
                    status: true,
                },
            },
            relations: ['user', 'orders'],
            ...(search
                ? {
                      where: [
                          { user: { name: ILike(`%${search}%`) } },
                          { user: { email: ILike(`%${search}%`) } },
                          { phone: ILike(`%${search}%`) },
                          ...(isNumeric
                              ? [{ customerId: Number(search) }]
                              : [{}]),
                      ],
                  }
                : {}),

            order: {
                customerId: 'ASC',
            },
        });

        const output = customers.map((customer) => {
            const totalOrder = customer.orders.filter((cur) => {
                return cur.status === OrderStatus.DELIVERED;
            }).length;

            const { orders, ...customerWithoutOrders } = customer;
            return {
                ...customerWithoutOrders,
                totalOrder,
            };
        });

        return {
            success: true,
            message: 'Customers Fetched Successfully',
            data: output,
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

        if (updateCustomerDto.password) {
            const salt = await bcrypt.genSalt();
            updateCustomerDto.password = await bcrypt.hash(
                updateCustomerDto.password,
                salt,
            );
        }

        customer.user.isVerified =
            updateCustomerDto.isVerified ?? customer.user.isVerified;
        customer.user.name = updateCustomerDto.name ?? customer.user.name;
        customer.user.email = updateCustomerDto.email ?? customer.user.email;
        customer.user.password =
            updateCustomerDto.password ?? customer.user.password;
        customer.address = updateCustomerDto.address ?? customer.address;
        customer.phone = updateCustomerDto.phone ?? customer.phone;

        const newEmailUser = await this.userRepository.findOne({
            where: {
                email: customer.user.email,
            },
            select: {
                userId: true,
            },
        });
        if (newEmailUser && newEmailUser.userId !== customer.user.userId) {
            throw new ConflictException('Email already exists');
        }

        const updated = await this.customerRepository.save(customer);

        const { password, verificationToken, ...userWithoutPassword } =
            updated.user;
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

        if (
            await this.riderRepository.findOneBy({
                riderNid: createRiderDto.riderNid,
            })
        ) {
            throw new ConflictException('NID already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createRiderDto.password, salt);

        const rider = await this.riderRepository.save({
            user: {
                name: createRiderDto.name,
                email: createRiderDto.email,
                password: hashedPassword,
                role: UserRoles.RIDER,
                isVerified: true,
            },

            phone: createRiderDto.phone,
            riderNid: createRiderDto.riderNid,
            nidImageUrl: nidImageUrl,
            isOnline: false,
            bkashAccount: createRiderDto.bkashAccount,
            bankAccount: createRiderDto.bankAccount,
        });

        const { password, verificationToken, ...userWithoutPassword } =
            rider.user;
        const output = { ...rider, user: userWithoutPassword };

        return {
            success: true,
            message: `Rider ${output.user.name} created successfully`,
            data: output,
        };
    }

    // get riders
    async getRiders(search?: string, status?: string): Promise<object> {
        search = search?.trim();
        status = status?.trim();
        status = status?.toLowerCase();

        const riders = await this.riderRepository.find({
            order: {
                riderId: 'ASC',
            },
            select: {
                riderId: true,
                user: {
                    userId: true,
                    name: true,
                    email: true,
                },
                riderNid: true,
                phone: true,
                isOnline: true,
                bkashAccount: true,
                bankAccount: true,
                deliveries: {
                    deliveryId: true,
                    order: {
                        total: true,
                        commissionAmount: true,
                        deliveryFee: true,
                        status: true,
                        paymentMethod: true,
                    },
                },
            },
            relations: ['user', 'deliveries', 'deliveries.order'],
            ...(search || status
                ? {
                      where: search
                          ? [
                                {
                                    user: { name: ILike(`%${search}%`) },
                                    ...(status
                                        ? { isOnline: status === 'online' }
                                        : {}),
                                },
                                {
                                    user: { email: ILike(`%${search}%`) },
                                    ...(status
                                        ? { isOnline: status === 'online' }
                                        : {}),
                                },
                                {
                                    phone: ILike(`%${search}%`),
                                    ...(status
                                        ? { isOnline: status === 'online' }
                                        : {}),
                                },
                            ]
                          : { isOnline: status === 'online' },
                  }
                : {}),
        });

        const output = riders.map((rider) => {
            const { deliveries, ...riderWithoutDeliveries } = rider;

            let totalDelivery = 0;
            const totalEarning: number = rider.deliveries.reduce(
                (total, cur) => {
                    totalDelivery +=
                        cur.order?.status === OrderStatus.DELIVERED ? 1 : 0;
                    return (
                        total +
                        (cur.order?.status === OrderStatus.DELIVERED
                            ? (cur.order?.deliveryFee ?? 0)
                            : 0)
                    );
                },
                0,
            );

            return {
                ...riderWithoutDeliveries,
                totalEarning,
                totalDelivery,
            };
        });

        return {
            success: true,
            message: 'Riders Fetched Successfully',
            data: output,
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

        const newEmailUser = await this.userRepository.findOne({
            where: {
                email: rider.user.email,
            },
            select: {
                userId: true,
            },
        });
        if (newEmailUser && newEmailUser.userId !== rider.user.userId) {
            throw new ConflictException('Email already exists');
        }

        const updated = await this.riderRepository.save(rider);

        const { password, verificationToken, ...userWithoutPassword } =
            updated.user;
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
    async getOrders(
        search?: string,
        status?: OrderStatus,
        dateFrom?: Date,
        dateTo?: Date,
    ): Promise<object> {
        const orders = await this.orderRepository.find({
            where: {
                ...(search && { orderId: parseInt(search) || 0 }),
                ...(status && { status }),
                ...(dateFrom && dateTo
                    ? {
                          orderAt: Between(
                              dateFrom,
                              new Date(
                                  new Date(dateTo).setHours(23, 59, 59, 999),
                              ),
                          ),
                      }
                    : dateFrom
                      ? { orderAt: MoreThanOrEqual(dateFrom) }
                      : dateTo
                        ? {
                              orderAt: LessThanOrEqual(
                                  new Date(
                                      new Date(dateTo).setHours(
                                          23,
                                          59,
                                          59,
                                          999,
                                      ),
                                  ),
                              ),
                          }
                        : {}),
            },

            select: {
                customerName: true,
                restaurantName: true,
                riderName: true,
                orderId: true,
                orderAt: true,
                subtotal: true,
                deliveryFee: true,
                discountAmount: true,
                voucherCode: true,
                total: true,
                paymentMethod: true,
                status: true,
                commissionAmount: true,
                delivery: true,
            },

            order: {
                orderId: 'asc',
            },
        });

        return {
            success: true,
            message: `Order Fetched Successfully`,
            data: orders,
        };
    }

    // get order
    async getOrder(orderId: number): Promise<object> {
        const order = await this.orderRepository.findOne({
            where: {
                orderId: orderId,
            },
            relations: {
                orderItems: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order Not Found');
        }

        return {
            success: true,
            message: `Order Fetched Successfully`,
            data: order,
        };
    }

    // cancel order
    async cancelOrder(orderId: number): Promise<object> {
        const order = await this.orderRepository.findOne({
            where: { orderId: orderId },
        });

        if (!order) {
            throw new BadRequestException('Invalid Order ID');
        }

        if (order.status === OrderStatus.DELIVERED) {
            throw new ForbiddenException('Order Already Delivered');
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new ForbiddenException('Order Already Cancelled');
        }

        order.status = OrderStatus.CANCELLED;
        const updated = await this.orderRepository.save(order);

        const updatedOrder = await this.orderRepository.findOne({
            where: {
                orderId: orderId,
            },
            relations: {
                orderItems: true,
            },
        });

        return {
            success: true,
            message: `Order Updated Successfully`,
            data: updatedOrder,
        };
    }
}
