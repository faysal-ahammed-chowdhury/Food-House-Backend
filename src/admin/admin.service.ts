import { Injectable } from '@nestjs/common';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Injectable()
export class AdminService {
    /* Manage Restaurant */

    /* Manage Rider */

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
    getAllRider(): object {
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
    filterRiders() {}

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
    deleteRider(riderId: string): object {
        return {
            success: true,
            message: 'Rider Updated Successfully',
            data: {
                riderId,
            },
        };
    }
}
