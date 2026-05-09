import { Injectable, ConflictException ,NotFoundException, BadRequestException} from "@nestjs/common";
import { CreateRiderDto, RiderStatusDto, UpdateRiderDto, AssignDeliveryDto } from "./rider.dto";
import { RiderEntity } from "../common/entities/rider.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../common/entities/user.entity";
import { DeliveryEntity } from "../common/entities/delivery.entity";
//import { CODSubmissionEntity } from "../common/entities/cod-submission.entity";
import * as bcrypt from 'bcrypt';
import { UserRoles } from "../common/enums/user-roles.enum";


@Injectable()
export class RiderService{
    constructor(
        @InjectRepository(RiderEntity)
        private riderRepository: Repository<RiderEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(DeliveryEntity)
        private deliveryRepository: Repository<DeliveryEntity>,
        // @InjectRepository(CODSubmissionEntity)
        // private codsubmissionEntity: Repository<CODSubmissionEntity>
    ){}

    //creating
    async checkUserExist(email: string): Promise<boolean> {
        const foundEmail = await this.userRepository.findOne({
            where: {email: email},
        });
        return Boolean(foundEmail);
    }
    async createRider(createRiderDto: CreateRiderDto): Promise<object> {
    
    
    const userExist = await this.checkUserExist(createRiderDto.email);
    if (userExist) {
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
        bkashAccount: createRiderDto.bkashAccount,
        bankAccount: createRiderDto.bankAccount,
        isOnline: false, 
    });

    
    const { password, ...userWithoutPassword } = rider.user;
    const output = { ...rider, user: userWithoutPassword };

    
    return {
        success: true,
        message: `Rider ${rider.user.name} created successfully`,
        data: output,
    };
}
    // -------- GET ALL RIDERS --------
   async getAllRiders(): Promise<object> {
        const riders = await this.riderRepository.find({ relations: ['user', 'deliveries'] });

        const output = riders.map(r => {
            const { password, ...userWithoutPassword } = r.user;
            return { ...r, user: userWithoutPassword };
        });

        return {
            success: true,
            message: `${riders.length} riders retrieved`,
            data: output,
        };
    }


    // -------- GET RIDER BY ID --------
    async getRiderById(riderId: number): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user', 'deliveries'],
        });

        if (!rider) throw new NotFoundException(`Rider with id ${riderId} not found`);

        const { password, ...userWithoutPassword } = rider.user;
        const output = {  user: userWithoutPassword };

        return {
            success: true,
            message: `Rider with id ${riderId} retrieved successfully`,
            data: output,
        };
    }


    // -------- UPDATE RIDER INFO --------
    async updateRider(riderId: number, updateRiderDto: UpdateRiderDto): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user'],
        });

        if (!rider) throw new NotFoundException('Rider not found');

        rider.user.name = updateRiderDto.name ?? rider.user.name;
        rider.phone = updateRiderDto.phone ?? rider.phone;

        if (updateRiderDto.password) {
        const salt = await bcrypt.genSalt();
        rider.user.password = await bcrypt.hash(updateRiderDto.password, salt);
    }

        await this.userRepository.save(rider.user);
        const updatedRider = await this.riderRepository.save(rider);

        const { password, ...userWithoutPassword } = updatedRider.user;
        const output = { ...updatedRider, user: userWithoutPassword };

        return {
            success: true,
            message: 'Rider updated successfully',
            data: output,
        };
    }

    // -------- UPDATE RIDER STATUS --------
    async updateRiderStatus(riderId: number, riderStatusDto: RiderStatusDto): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user'],
        });

        if (!rider) throw new NotFoundException('Rider not found');

        if (riderStatusDto.isOnline !== undefined) rider.isOnline = riderStatusDto.isOnline;

        const updatedRider = await this.riderRepository.save(rider);

        const { password, ...userWithoutPassword } = updatedRider.user;
        const output = { ...updatedRider, user: userWithoutPassword };

        return {
            success: true,
            message: 'Rider status updated successfully',
            data: output,
        };
    }

    // -------- DELETE RIDER --------
     async deleteRider(riderId: number): Promise<object> {
        const rider = await this.riderRepository.findOne({
            where: { riderId },
            relations: ['user'],
        });

        if (!rider) throw new NotFoundException('Rider not found');

        await this.riderRepository.remove(rider);

        return {
            success: true,
            message: 'Rider deleted successfully',
            data: { riderId: rider.riderId, userId: rider.user.userId },
        };
    }

     // -------- ASSIGN DELIVERY --------
     async assignDelivery(assignDeliveryDto: AssignDeliveryDto): Promise<object> {
        const rider = await this.riderRepository.findOne({ where: { riderId: assignDeliveryDto.riderId } });
        if (!rider) throw new NotFoundException('Rider not found');

        const delivery = await this.deliveryRepository.findOne({ where: { deliveryId: assignDeliveryDto.deliveryId } });
        if (!delivery) throw new NotFoundException('Delivery not found');

        delivery.rider = rider;
        delivery.acceptedAt = new Date();
        const updatedDelivery = await this.deliveryRepository.save(delivery);

        return {
            success: true,
            message: 'Delivery assigned successfully',
            data: updatedDelivery,
        };
    }

    

}
