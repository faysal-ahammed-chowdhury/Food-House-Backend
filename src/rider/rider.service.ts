import { Injectable, ConflictException ,NotFoundException, BadRequestException} from "@nestjs/common";

import { RiderEntity } from "../common/entities/rider.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull, Or, In } from "typeorm";
import { UserEntity } from "../common/entities/user.entity";
import { DeliveryEntity } from "../common/entities/delivery.entity";
import { OrderEntity } from "../common/entities/order.entity";
import {UpdateRiderDto} from "./dto/update-rider.dto";
import {RiderStatusDto} from "./dto/rider-status.dto";
import {AssignDeliveryDto} from "./dto/assign-delivery.dto";
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

    //---------
    

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
       // if (nidImageUrl) rider.nidImageUrl = nidImageUrl;

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

    //change password
    async changePassword(id: number, dto: ChangePasswordDto) {
        const rider = await this.riderRepository.findOne({
            where: { riderId: id },
            relations: ["user"],
        });

        if (!rider) throw new NotFoundException("Rider not found");

        const match = await bcrypt.compare(dto.oldPassword, rider.user.password);

        if (!match) throw new BadRequestException("Wrong password");

        const salt = await bcrypt.genSalt();
        rider.user.password = await bcrypt.hash(dto.newPassword, salt);

        await this.userRepository.save(rider.user);

        return { success: true, message: "Password changed" };
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
                delivery: {
                    rider: { riderId },
                },
            },
    });

    // Available requests
    const availableRequests = await this.orderRepository.count({
        where: {
             status: OrderStatus.PENDING,
        },
    });

    // Completed
    const completedOrders = await this.orderRepository.count({
        where: {
                status: OrderStatus.DELIVERED,
                delivery: {
                    rider: { riderId },
                },
            },
    });

    // Earnings 
    const deliveredOrders = await this.orderRepository.find({
            where: {
                status: OrderStatus.DELIVERED,
                delivery: {
                    rider: { riderId },
                },
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


/*


    */

}
