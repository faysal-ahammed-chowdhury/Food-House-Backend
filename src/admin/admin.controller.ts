import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminService } from './admin.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {
        this.adminService = adminService;
    }

    /* ========== Manage Restaurant ========== */

    // create a restaurant route
    @Post('create-restaurant')
    @UsePipes(new ValidationPipe())
    createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto): object {
        return this.adminService.createRestaurant(createRestaurantDto);
    }

    // get all restaurants route
    @Get('get-all-restaurants')
    getAllRestaurants(): object {
        return this.adminService.getAllRestaurants();
    }

    // filter restaurants route
    @Get('filter-restaurants')
    filterRestaurants(
        @Query('search') search: string,
        @Query('filter') filter: string,
    ): object {
        return this.adminService.filterRestaurants(search, filter);
    }

    // update restaurant route
    @Put('update-restaurant/:id')
    @UsePipes(new ValidationPipe())
    updateRestaurant(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Body() updateRestaurantDto: UpdateRestaurantDto,
    ): object {
        return this.adminService.updateRestaurant(
            restaurantId,
            updateRestaurantDto,
        );
    }

    // delete restaurant route
    @Delete('delete-restaurant/:id')
    deleteRestaurant(@Param('id', ParseIntPipe) restaurantId: number): object {
        return this.adminService.deleteRestaurant(restaurantId);
    }

    /* ========== Manage Rider ========== */

    // create rider route
    @Post('create-rider')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(
        FileInterceptor('nid_img', {
            fileFilter: function (req, file, callback) {
                if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
                    return callback(
                        new BadRequestException('Only image files allowed!'),
                        false,
                    );
                }

                callback(null, true); // okay
            },
            limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
            storage: diskStorage({
                // destination: './uploads',
                // filename(req, file, callback) {
                //     callback(null, Date.now() + file.originalname);
                // },
            }),
        }),
    )
    createRider(@Body() createRiderDto: CreateRiderDto): object {
        return this.adminService.createRider(createRiderDto);
    }

    // get all rider route
    @Get('get-all-riders')
    getAllRiders(): object {
        return this.adminService.getAllRiders();
    }

    // filter riders route
    @Get('filter-riders')
    filterRiders(
        @Query('search') search: string,
        @Query('filter') filter: string,
    ): object {
        return this.adminService.filterRiders(search, filter);
    }

    // update rider route
    @Put('update-rider/:id')
    @UsePipes(new ValidationPipe())
    updateRider(
        @Param('id', ParseIntPipe) riderId: number,
        @Body() updateRiderDto: UpdateRiderDto,
    ): object {
        return this.adminService.updateRider(riderId, updateRiderDto);
    }

    // delete rider route
    @Delete('delete-rider/:id')
    deleteRider(@Param('id', ParseIntPipe) riderId: number): object {
        return this.adminService.deleteRider(riderId);
    }
}
