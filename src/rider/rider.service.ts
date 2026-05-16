import { Injectable, ConflictException ,NotFoundException, BadRequestException} from "@nestjs/common";

import { RiderEntity } from "../common/entities/rider.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull, Or, In } from "typeorm";
import { UserEntity } from "../common/entities/user.entity";
import { DeliveryEntity } from "../common/entities/delivery.entity";
import { OrderEntity } from "../common/entities/order.entity";
import {UpdateRiderDto} from "./dto/update-rider.dto";
import {RiderStatusDto} from "./dto/rider-status.dto";
import {AcceptDeliveryDto} from "./dto/accept-delivery.dto";
import {UpdateDeliveryDto} from "./dto/update-delivery.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";
import * as bcrypt from 'bcrypt';
import { UserRoles } from "../common/enums/user-roles.enum";
import { OrderStatus } from "src/common/enums/order-status.enum";


@Injectable()
export class RiderService{
    getImageByRiderId // remove sensitive data
        (riderId: number): object {
            throw new Error("Method not implemented.");
    }
    constructor(
        @InjectRepository(RiderEntity)
        private riderRepository: Repository<RiderEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(DeliveryEntity)
        private deliveryRepository: Repository<DeliveryEntity>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ){}

    async getRiderIdByUserId(userId: number): Promise<number> {
    const rider = await this.riderRepository.findOne({
      where: { user: { userId } },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return rider.riderId;
  }


    //get by id---
    async getRiderById(riderId: number): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user', 'deliveries'],
        });

        if (!rider) throw new NotFoundException(`Rider with id ${riderId} not found`);

        const { password, ...userWithoutPassword } = rider.user;
        const output = {  

            riderId: rider.riderId,
            name: userWithoutPassword.name,
            email: userWithoutPassword.email,
            phone: rider.phone,
            riderNid: rider.riderNid,
            bkashAccount: rider.bkashAccount,
            bankAccount: rider.bankAccount,
            nidImageUrl: rider.nidImageUrl,
            isOnline: rider.isOnline,
        };

        return {
            success: true,
            message: `Rider with id ${riderId} retrieved successfully`,
            data: output,
        };
    }

    ///nid image url get by id
    async getRiderImage(riderId: number): Promise<string> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
        });
        if (!rider) throw new NotFoundException("Rider not found");
        if (!rider.nidImageUrl) {
            throw new NotFoundException("Image not found");
        }
        return rider.nidImageUrl; 
    }

    //Update Rider Profile-----
    async updateRider(
        riderId: number,
        updateRiderDto: UpdateRiderDto,
        //nidImageUrl?: string,
        ): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user'],
        });

        if (!rider) throw new NotFoundException('Rider not found');

        // Update rider information
        if (updateRiderDto.name) rider.user.name = updateRiderDto.name;
        if (updateRiderDto.phone) rider.phone = updateRiderDto.phone;
        if (updateRiderDto.bkashAccount) rider.bkashAccount = updateRiderDto.bkashAccount;
        if (updateRiderDto.bankAccount) rider.bankAccount = updateRiderDto.bankAccount;
       

        await this.riderRepository.save(rider);
        await this.userRepository.save(rider.user);

        return {
            success: true,
            message: 'Rider updated successfully',
            data: {
                    name: rider.user.name,
                    phone: rider.phone,
                    bkashAccount: rider.bkashAccount,
                    bankAccount: rider.bankAccount,
                }
        };
    }

    
    //dashboard data get by id
    async getDashboardData(riderId: number): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user'],
        });
        if (!rider) throw new NotFoundException("Rider not found");

           // Active deliveries
        const activeDeliveries = await this.orderRepository.count({
            where: {
                status: In([
                    OrderStatus.RIDER_ASSIGNED,
                    OrderStatus.PREPARING,
                    OrderStatus.READY,
                    OrderStatus.PICKED,
                ]),
                
                    riderId:  riderId ,
                
            },
        });

            // Available requests
        const availableRequests = await this.orderRepository.count({
            where: {
                status: OrderStatus.READY,
            },
        });
    


        // Completed
        const completedOrders = await this.orderRepository.count({
            where: {
                    status: OrderStatus.DELIVERED,
                    riderId: riderId,
                },
        });

        // Earnings 
        const deliveredOrders = await this.orderRepository.find({
            where: {
                status: OrderStatus.DELIVERED,
                riderId:  riderId ,
            },
        });

        let todaysEarnings = 0;

        for (const order of deliveredOrders) {
            todaysEarnings += order.deliveryFee || 0;
        }

        return {
            success: true,
            data: {
                isOnline: rider.isOnline,
                activeDeliveries,
                availableRequests,
                completedOrders,
                todaysEarnings,
            },
        };
    }

    // get rider status
    async getRiderStatus(riderId: number): Promise<object> {
    const rider = await this.riderRepository.findOne({
        where: { riderId },
    });

    if (!rider) throw new NotFoundException("Rider not found");

    return {
        success: true,
        data: {
            isOnline: rider.isOnline,
        },
    };
}

    //update rider status
    async updateRiderStatus(riderId: number, dto: RiderStatusDto) {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
        });

        if (!rider) throw new NotFoundException("Rider not found");

        rider.isOnline = dto.isOnline;

        await this.riderRepository.save(rider);

        return {
            success: true,
            message: "Status updated",
            data: {
                riderId: rider.riderId,
                isOnline: rider.isOnline,
            },
        };
    }

    async checkPassword(
        riderId: number,
        password: string,
         ) {
        const rider = await this.riderRepository.findOne({
        where: { riderId },
        relations: ['user'],
        });

        if (!rider) {
        throw new NotFoundException('Rider not found');
        }

        const isMatch = await bcrypt.compare(
        password,
        rider.user.password,
        );

        return {
        matched: isMatch,
        };
    }
    ////////////////
  
    async changePassword(
        riderId: number,
        newPassword: string,
        ){
            const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user'],
            });

            if (!rider) {
            throw new NotFoundException('Rider not found');
            }

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(newPassword, salt);    

            rider.user.password = hashedPassword;

            await this.userRepository.save(rider.user);

            return {
            success: true,
            message: 'Password updated successfully',
            };
    }
    
    ///available request-
    async getAvailableRequests() {
        return this.orderRepository.find({
        where: { status: OrderStatus.ACCEPTED },
        relations: ['restaurant', 'customer'],
        });
    }

  //  Accept request
 
    async acceptDelivery(dto: AcceptDeliveryDto) {
        const { riderId, orderId } = dto;

        const rider = await this.riderRepository.findOne({
        where: { riderId },
        relations: ['user'],
        });

        if (!rider) {
        throw new NotFoundException('Rider not found');
        }

        const order = await this.orderRepository.findOne({
        where: { orderId },
        });

        if (!order) {
        throw new NotFoundException('Order not found');
        }

        if (order.status === OrderStatus.RIDER_ASSIGNED) {
        throw new BadRequestException('Order already assigned to a rider');
        }

        order.status = OrderStatus.RIDER_ASSIGNED;
        order.riderName = rider.user.name;
        order.riderId = rider.riderId;
        return await this.orderRepository.save(order);
    }


    ///marked picked--
        async markPicked(dto: UpdateDeliveryDto) {
        const { riderId, orderId } = dto;

        const rider = await this.riderRepository.findOne({
        where: { riderId },
        relations: ['user'],
        });

        if (!rider) {
        throw new NotFoundException('Rider not found');
        }

        const order = await this.orderRepository.findOne({
        where: { orderId },
        });

        if (!order) {
        throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.READY) {
        throw new BadRequestException('Order not ready for picking');
        }

        order.status = OrderStatus.PICKED;
        
        return await this.orderRepository.save(order);
    }

     // Mark delivered
    async markDelivered(dto: UpdateDeliveryDto) {
        const { riderId, orderId } = dto;

        const rider = await this.riderRepository.findOne({
        where: { riderId },
        relations: ['user'],
        });

        if (!rider) {
        throw new NotFoundException('Rider not found');
        }

        const order = await this.orderRepository.findOne({
        where: { orderId },
        });

        if (!order) {
        throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PICKED) {
        throw new BadRequestException('Order not ready for delivery');
        }

        order.status = OrderStatus.DELIVERED;
        
        return await this.orderRepository.save(order);
    }

    //  My deliveries
    async myDeliveries(riderId: number) {
        return this.deliveryRepository.find({
        where: { rider: { riderId } },
        relations: ['order', 'order.customer', 'order.restaurant'],
        });
    }
    ///get running orders by rider id- jegula delivery korbor jonno accept korechi but delivered hoy nai

    async getRunningOrdersByRider(riderId: number) {
        return await this.orderRepository.find({
        where: {
            riderId,
            status: In([
            OrderStatus.RIDER_ASSIGNED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.PICKED,
            ]),
        },
        order: {
            orderAt: 'DESC',
        },
        });
    }
 
    //count delivered orders by rider id
    async countDeliveredOrdersByRider(riderId: number) {
        return await this.orderRepository.count({
        where: {
            riderId,
            status: OrderStatus.DELIVERED,
        },
        });
    }


  ///delivered
    async getDeliveredOrdersByRider(riderId: number) {
        return await this.orderRepository.find({
        where: {
            riderId,
            status: In([
            OrderStatus.DELIVERED,
            ]),
        },
        order: {
            orderAt: 'DESC',
        },
        });
    }

}

 