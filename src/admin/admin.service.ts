import { Injectable } from '@nestjs/common';
import { CreateRiderDto } from './dto/create-rider.dto';

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

    // search rider
    searchRiderByRiderIdOrPhone(val: string): object {
        if (!val) return {};
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
}
