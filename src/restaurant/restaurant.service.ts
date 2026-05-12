import {ConflictException, Injectable, NotFoundException, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RestaurantEntity } from "../common/entities/restaurant.entity";
import { OneOrMore, Repository } from "typeorm";
import { ItemEntity } from "../common/entities/item.entity";
import { CategoryEntity } from "../common/entities/category.entity";
import { VoucherEntity } from "../common/entities/voucher.entity";
import { UserEntity } from "../common/entities/user.entity";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import * as bcrypt from 'bcrypt';
import { UserRoles } from "../common/enums/user-roles.enum";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
 

@Injectable()
export class RestaurantService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RestaurantEntity)
        private readonly restaurantRepository: Repository<RestaurantEntity>,
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>,
        @InjectRepository(ItemEntity)
        private readonly itemRepository: Repository<ItemEntity>,
        @InjectRepository(VoucherEntity)
        private readonly voucherRepository: Repository<VoucherEntity>,
        
    ){}

    async checkUserExist(email: string): Promise<boolean> {
        const foundEmail = await this.userRepository.findOne({
            where: {email: email},
        });
        return Boolean(foundEmail);
    }

    async createRestaurant(createRestaurantDto: CreateRestaurantDto,): Promise<object>{
        const userExist = await this.checkUserExist(createRestaurantDto.email);
        if (userExist) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createRestaurantDto.password,salt);

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
            currentCommissionPercent:createRestaurantDto.currentCommissionPercent,
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


    async getRestaurantById(restaurantId: number) {
    const restaurant = await this.restaurantRepository.findOne({
        where: { restaurantId: restaurantId },
        relations: ['user'],
    });

    if (!restaurant) {
        throw new NotFoundException(`Restaurant with id ${restaurantId} doesn't exist`);
    }
    const { password, ...safeUserInfo } = restaurant.user;
    const formattedData = {
        ...restaurant,
        user: {
            userId: safeUserInfo.userId,
            name: safeUserInfo.name,
            email: safeUserInfo.email,
            role: safeUserInfo.role,
            isVerified: safeUserInfo.isVerified,
            verificationToken: safeUserInfo.verificationToken,
        }
    };

    return {
        success: true,
        message: `Restaurant with id ${restaurantId} retrieved successfully`,
        data: formattedData,
    };
}


    async updateRestaurant(
        restaurantId: number, 
        updateRestaurantDto: UpdateRestaurantDto,
        uploadedBannerUrl?: string
    ): Promise<object> {
        const restaurant = await this.restaurantRepository.findOne({
            relations: ['user'],
            where: { restaurantId : restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundException(`Restaurant with id ${restaurantId} doesn't exist`);
        }

        if (updateRestaurantDto.email && (updateRestaurantDto.email !== restaurant.user.email)){
            const emailTaken = await this.userRepository.findOne({
                where: { email: updateRestaurantDto.email },
            });
            if (emailTaken) {
                throw new ConflictException('Email already in use');
            }
        }

        if (updateRestaurantDto.password) {
            const salt = await bcrypt.genSalt();
            updateRestaurantDto.password = await bcrypt.hash(updateRestaurantDto.password, salt);
        }

        restaurant.user.name = updateRestaurantDto.name ?? restaurant.user.name;
        restaurant.user.email = updateRestaurantDto.email ?? restaurant.user.email;
        restaurant.user.password = updateRestaurantDto.password ?? restaurant.user.password;
        restaurant.description = updateRestaurantDto.description ?? restaurant.description;
        restaurant.address = updateRestaurantDto.address ?? restaurant.address;
        restaurant.isOpen = updateRestaurantDto.isOpen ?? restaurant.isOpen;
        restaurant.currentCommissionPercent = updateRestaurantDto.currentCommissionPercent ?? restaurant.currentCommissionPercent;
        restaurant.currentDeliveryFee = updateRestaurantDto.currentDeliveryFee ?? restaurant.currentDeliveryFee;
        restaurant.bkashAccount = updateRestaurantDto.bkashAccount ?? restaurant.bkashAccount;
        restaurant.bankAccount = updateRestaurantDto.bankAccount ?? restaurant.bankAccount;

        if (uploadedBannerUrl) {
            restaurant.bannerUrl = uploadedBannerUrl;
        } else if (updateRestaurantDto.bannerUrl) {
            restaurant.bannerUrl = updateRestaurantDto.bannerUrl;
        }

        const updated = await this.restaurantRepository.save(restaurant);

        const { password, ...userWithoutPassword } = updated.user;
        const output = { ...updated, user: userWithoutPassword };

        return {
            success: true,
            message: `Restaurant Info Updated Successfully`,
            data: output,
        };
    }

    
    async updateRestaurantStatus(restaurantId: number, updateRestaurantDto: UpdateRestaurantDto): Promise<RestaurantEntity> {
        const restaurant = await this.restaurantRepository.preload({
            restaurantId: restaurantId,
            ...updateRestaurantDto,   
         });
         if(!restaurant) {
            throw new NotFoundException(`Restaurant with id ${restaurantId} doesn't exist`);
         }
         return this.restaurantRepository.save(restaurant);
    }

    async getRestaurantPassword(restaurantId: number): Promise<string> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { restaurantId: restaurantId },
            relations: ['user'],
        });
        if (!restaurant) {
            throw new NotFoundException(`Restaurant with id ${restaurantId} doesn't exist`);
        }
        return restaurant.user.password;
    }

    async checkPasswordMatch(restaurantId: number, plainPassword: string): Promise<boolean> {
        const DBPassword = await this.getRestaurantPassword(restaurantId);
        return bcrypt.compare(plainPassword, DBPassword);
    }


    async createVoucher(createVoucherDto: CreateVoucherDto): Promise<Object> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { restaurantId: createVoucherDto.restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found');
        }

        const voucher = this.voucherRepository.create({
            restaurant,
            voucherCode: createVoucherDto.voucherCode,
            percent: createVoucherDto.percent,
            maxDiscount: createVoucherDto.maxDiscount,
            minOrderAmount: createVoucherDto.minOrderAmount,
            expiresAt: createVoucherDto.expiresAt,
        });

        const savedVoucher = await this.voucherRepository.save(voucher);
        return {
            message: 'Voucher created successfully',
            data: {
                restaurant: savedVoucher.restaurant,
                voucherId: savedVoucher.voucherId,
                voucherCode: savedVoucher.voucherCode,
                percent: savedVoucher.percent,
                maxDiscount: savedVoucher.maxDiscount,
                minOrderAmount: savedVoucher.minOrderAmount,
                expiresAt: savedVoucher.expiresAt,
            },
        };
    }

    async getVouchersByRestaurant(restaurantId: number): Promise<VoucherEntity[]> {
        return this.voucherRepository.find({
            where: {
                restaurant: { restaurantId: restaurantId },
            },
                order: {expiresAt: 'ASC'},
        });
    }

    async deleteVoucher(voucherId: number): Promise<object> {
        const voucher = await this.voucherRepository.findOne({
            where: { voucherId },
            relations: ['restaurant'],
        });

        if (!voucher) {
            throw new NotFoundException(`Voucher with id ${voucherId} not found`);
        }

        await this.voucherRepository.delete(voucherId);

        return {
            message: 'Voucher deleted successfully',
            data: {
                voucherId: voucher.voucherId,
                restaurantId: voucher.restaurant.restaurantId,
            },
        };
    }

    async getRestaurantByUserId(userId: number): Promise<RestaurantEntity | null> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { user: { userId: userId } },
        });
        return restaurant || null;
    }



    async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        const { restaurantId, name } = createCategoryDto;

        const restaurant = await this.restaurantRepository.findOne({
            where: { restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found');
        }

        const category = this.categoryRepository.create({
            name,
            restaurant,
        });

        return await this.categoryRepository.save(category);
    }

    async getCategoriesByRestaurantId(restaurantId: number) {
        const categories = await this.categoryRepository.find({
            where: {
                restaurant: { restaurantId: restaurantId },
            },
            relations: ['items'],
            order: {
                categoryId: 'ASC',
            },
        });

        if (!categories.length) {
            throw new NotFoundException('No categories found for this restaurant');
        }
        return categories;
    }
    
    async updateCategoryByRestaurant(restaurantId: number,categoryId: number,updateCategoryDto: UpdateCategoryDto){
        const category = await this.categoryRepository.findOne({
            where: {
                categoryId: categoryId,
                restaurant: { restaurantId: restaurantId },
            },
            relations: ['items'],
        });
        if (!category) {
            throw new NotFoundException('Category not found for this restaurant',);
        }
        if (updateCategoryDto.name !== undefined) category.name = updateCategoryDto.name;
        if (updateCategoryDto.restaurantId !== undefined) {
            const restaurant = await this.restaurantRepository.findOne({
                where: { restaurantId: updateCategoryDto.restaurantId },
            });
            if (!restaurant) throw new NotFoundException('Restaurant not found');
        }
        return await this.categoryRepository.save(category);
    }


    async deleteCategoryByRestaurant(restaurantId: number, categoryId: number) {
        const category = await this.categoryRepository.findOne({
            where: {
                categoryId: categoryId,
                restaurant: { restaurantId: restaurantId },
            },
        });

        if (!category) {
            throw new NotFoundException(
                'This category does not exist for the specified restaurant',
            );
        }
        await this.categoryRepository.remove(category);
        return { message: 'Category deleted successfully' };
    }


    // async create(createItemDto: CreateItemDto, imageUrl: string,): Promise<ItemEntity> {
    //     const { categoryId, restaurantId } = createItemDto;

    //     const category = await this.categoryRepository.findOne({
    //         where: { categoryId },
    //     });
    //     if (!category) {
    //         throw new NotFoundException('Category not found');
    //     }

    //     const restaurant = await this.restaurantRepository.findOne({
    //         where: { restaurantId },
    //     });
    //     if (!restaurant) {
    //         throw new NotFoundException('Restaurant not found');
    //     }
    //     const item = this.itemRepository.create({
    //         name: createItemDto.name,
    //         description: createItemDto.description,
    //         price: createItemDto.price,
    //         imageUrl: imageUrl,
    //         isAvailable: true,
    //         preparationTime: createItemDto.preparationTime,
    //         category,
    //         restaurant,
    //     });
    //     return this.itemRepository.save(item);
    // }
        
    

     

    

}