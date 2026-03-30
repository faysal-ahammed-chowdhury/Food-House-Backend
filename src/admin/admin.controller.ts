import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { AdminService } from './admin.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {
        this.adminService = adminService;
    }

    /* ========== Manage Admin ========== */

    /* ========== Manage Restaurant ========== */

    // create a restaurant route
    @Post('restaurants')
    @UsePipes(new ValidationPipe())
    createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto): object {
        return this.adminService.createRestaurant(createRestaurantDto);
    }

    // get restaurants route
    @Get('restaurants')
    @UseGuards(AuthGuard)
    getRestaurants(
        @Query('search') search: string,
        @Query('filter') filter: string,
    ): object {
        return this.adminService.getRestaurants(search, filter);
    }

    // get restaurant route
    @Get('restaurants/:id')
    getRestaurant(@Param('id', ParseIntPipe) restaurantId: number): object {
        return this.adminService.getRestaurant(restaurantId);
    }

    // update restaurant route
    @Put('restaurants/:id')
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
    @Delete('restaurants/:id')
    deleteRestaurant(@Param('id', ParseIntPipe) restaurantId: number): object {
        return this.adminService.deleteRestaurant(restaurantId);
    }

    /* ========== Manage Menu ========== */

    // get restaurant menu route
    @Get('restaurants/:id/menu')
    getRestaurantMenu(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Query('search') search: string,
        @Query('filter') filter: string,
    ) {
        return this.adminService.getRestaurantMenu(
            restaurantId,
            search,
            filter,
        );
    }

    // add new item route
    @Post('restaurants/:id/menu/items')
    @UsePipes(new ValidationPipe())
    addNewItem(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Body() createItemDto: CreateItemDto,
    ) {
        return this.adminService.addNewItem(restaurantId, createItemDto);
    }

    // update item route
    @Put('menu/items/:id')
    @UsePipes(new ValidationPipe())
    updateItem(
        @Param('id', ParseIntPipe) itemId: number,
        @Body() updateItemDto: UpdateItemDto,
    ) {
        return this.adminService.updateItem(itemId, updateItemDto);
    }

    // set item availability route
    @Patch('menu/items/:id/availability')
    setItemAvailability(
        @Param('id', ParseIntPipe) itemId: number,
        @Body('isAvailable', ParseBoolPipe) isAvailable: boolean,
    ) {
        return this.adminService.setItemAvailability(itemId, isAvailable);
    }

    // delete item route
    @Delete('menu/items/:id')
    deleteItem(@Param('id', ParseIntPipe) itemId: number) {
        return this.adminService.deleteItem(itemId);
    }

    // add new category route
    @Post('restaurants/:id/menu/categories')
    @UsePipes(new ValidationPipe())
    addNewCategory(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        return this.adminService.addNewCategory(
            restaurantId,
            createCategoryDto,
        );
    }

    // update category
    @Put('menu/categories/:id')
    @UsePipes(new ValidationPipe())
    updateCategory(
        @Param('id', ParseIntPipe) categoryId: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.adminService.updateCategory(categoryId, updateCategoryDto);
    }

    // delete category route
    @Delete('menu/categories/:id')
    deleteCategory(@Param('id', ParseIntPipe) categoryId: number) {
        return this.adminService.deleteCategory(categoryId);
    }

    /* ========== Manage Rider ========== */

    // create rider route
    @Post('riders')
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

    // get riders route
    @Get('riders')
    getRiders(
        @Query('search') search: string,
        @Query('filter') filter: string,
    ): object {
        return this.adminService.getRiders(search, filter);
    }

    // get rider route
    @Get('riders/:id')
    getRider(@Param('id', ParseIntPipe) riderId: number): object {
        return this.adminService.getRider(riderId);
    }

    // update rider route
    @Put('riders/:id')
    @UsePipes(new ValidationPipe())
    updateRider(
        @Param('id', ParseIntPipe) riderId: number,
        @Body() updateRiderDto: UpdateRiderDto,
    ): object {
        return this.adminService.updateRider(riderId, updateRiderDto);
    }

    // delete rider route
    @Delete('riders/:id')
    deleteRider(@Param('id', ParseIntPipe) riderId: number): object {
        return this.adminService.deleteRider(riderId);
    }

    /* ========== Manage Order ========== */

    // get all order route
    @Get('orders')
    getOrders(
        @Query('search') search: string,
        @Query('status') status: OrderStatus,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
        @Query('paymentMethod') paymentMethod: PaymentMethod,
        @Query('restaurantId', ParseIntPipe) restaurantId: number,
        @Query('riderId', ParseIntPipe) riderId: number,
    ) {
        return this.adminService.getOrders(
            search,
            status,
            dateFrom,
            dateTo,
            paymentMethod,
            restaurantId,
            riderId,
        );
    }

    // get order route
    @Get('orders/:id')
    getOrder(@Param('id', ParseIntPipe) orderId: number) {
        return this.adminService.getOrder(orderId);
    }

    // cancel order route
    @Patch('orders/:id/cancel')
    cancelOrder(@Param('id', ParseIntPipe) orderId: number) {
        return this.adminService.cancelOrder(orderId);
    }
}
