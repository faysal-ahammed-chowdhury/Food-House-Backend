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
    UploadedFile,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
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

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {
        this.adminService = adminService;
    }

    /* ========== Dashboard APIs ========== */

    // get stats
    @Get('stats')
    async getStats(): Promise<object> {
        return this.adminService.getStats();
    }

    // get recent orders
    @Get('orders/recent')
    async getRecentOrders(): Promise<object> {
        return this.adminService.getRecentOrders();
    }

    /* ========== Manage Admin ========== */

    // create admin route
    @Post('admins')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    createAdmin(@Body() createAdminDto: CreateAdminDto): object {
        return this.adminService.createAdmin(createAdminDto);
    }

    // get admins route
    @Get('admins')
    async getAdmins(@Query('search') search?: string): Promise<object> {
        return this.adminService.getAdmins(search);
    }

    // get admin route
    @Get('admins/:id')
    async getAdmin(@Param('id', ParseIntPipe) userId: number): Promise<object> {
        return this.adminService.getAdmin(userId);
    }

    // update admin route
    @Put('admins/:id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateAdmin(
        @Param('id', ParseIntPipe) userId: number,
        @Body() updateAdminDto: UpdateAdminDto,
    ): Promise<object> {
        return this.adminService.updateAdmin(userId, updateAdminDto);
    }

    // delete admin route
    @Delete('admins/:id')
    async deleteAdmin(
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<object> {
        return this.adminService.deleteAdmin(userId);
    }

    /* ========== Manage Restaurant ========== */

    // create a restaurant route
    @Post('restaurants')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async createRestaurant(
        @Body() createRestaurantDto: CreateRestaurantDto,
    ): Promise<object> {
        return this.adminService.createRestaurant(createRestaurantDto);
    }

    // get restaurants route
    @Get('restaurants')
    async getRestaurants(@Query('search') search?: string): Promise<object> {
        return this.adminService.getRestaurants(search);
    }

    // get restaurant route
    @Get('restaurants/:id')
    async getRestaurant(
        @Param('id', ParseIntPipe) restaurantId: number,
    ): Promise<object> {
        return this.adminService.getRestaurant(restaurantId);
    }

    // update restaurant route
    @Put('restaurants/:id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateRestaurant(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Body() updateRestaurantDto: UpdateRestaurantDto,
    ): Promise<object> {
        return this.adminService.updateRestaurant(
            restaurantId,
            updateRestaurantDto,
        );
    }

    // delete restaurant route
    @Delete('restaurants/:id')
    async deleteRestaurant(
        @Param('id', ParseIntPipe) restaurantId: number,
    ): Promise<object> {
        return this.adminService.deleteRestaurant(restaurantId);
    }

    /* ========== Manage Menu ========== */

    // get restaurant items route
    @Get('restaurants/:id/items')
    async getRestaurantItems(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Query('search') search?: string,
        @Query('category') categoryName?: string,
    ): Promise<object> {
        return this.adminService.getRestaurantItems(
            restaurantId,
            search,
            categoryName,
        );
    }

    // add new item route
    @Post('restaurants/:id/items')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async addNewItem(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Body() createItemDto: CreateItemDto,
    ): Promise<object> {
        return this.adminService.addNewItem(restaurantId, createItemDto);
    }

    // update item route
    @Put('items/:id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateItem(
        @Param('id', ParseIntPipe) itemId: number,
        @Body() updateItemDto: UpdateItemDto,
    ): Promise<object> {
        return this.adminService.updateItem(itemId, updateItemDto);
    }

    // set item availability route
    @Patch('items/:id/availability')
    async setItemAvailability(
        @Param('id', ParseIntPipe) itemId: number,
        @Body('isAvailable', ParseBoolPipe) isAvailable: boolean,
    ): Promise<object> {
        return this.adminService.setItemAvailability(itemId, isAvailable);
    }

    // delete item route
    @Delete('items/:id')
    async deleteItem(
        @Param('id', ParseIntPipe) itemId: number,
    ): Promise<object> {
        return this.adminService.deleteItem(itemId);
    }

    // get restaurant categories route
    @Get('restaurants/:id/categories')
    async getRestaurantCategories(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Query('search') search?: string,
    ): Promise<object> {
        return this.adminService.getRestaurantCategories(restaurantId, search);
    }

    // add new category route
    @Post('restaurants/:id/categories')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async addNewCategory(
        @Param('id', ParseIntPipe) restaurantId: number,
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<object> {
        return this.adminService.addNewCategory(
            restaurantId,
            createCategoryDto,
        );
    }

    // update category
    @Put('categories/:id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateCategory(
        @Param('id', ParseIntPipe) categoryId: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<object> {
        return this.adminService.updateCategory(categoryId, updateCategoryDto);
    }

    // delete category route
    @Delete('categories/:id')
    async deleteCategory(
        @Param('id', ParseIntPipe) categoryId: number,
    ): Promise<object> {
        return this.adminService.deleteCategory(categoryId);
    }

    /* ========== Manage Customer ========== */

    // craete a customer route
    @Post('customers')
    @UsePipes(new ValidationPipe())
    async createCustomer(
        @Body() createCustomerDto: CreateCustomerDto,
    ): Promise<object> {
        return this.adminService.createCustomer(createCustomerDto);
    }

    // get customers route
    @Get('customers')
    async getCustomers(@Query('search') search?: string): Promise<object> {
        return this.adminService.getCustomers(search);
    }

    // update customers route
    @Put('customers/:id')
    @UsePipes(new ValidationPipe())
    async updateCustomers(
        @Param('id', ParseIntPipe) customerId: number,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<object> {
        return this.adminService.updateCustomer(customerId, updateCustomerDto);
    }

    // delete customer route
    @Delete('customers/:id')
    deleteCustomer(@Param('id', ParseIntPipe) customerId: number): object {
        return this.adminService.deleteCustomer(customerId);
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
                destination: './uploads',
                filename(req, file, callback) {
                    callback(null, Date.now() + file.originalname);
                },
            }),
        }),
    )
    async createRider(
        @Body() createRiderDto: CreateRiderDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<object> {
        if (!file) {
            throw new BadRequestException('NID image is required');
        }

        return this.adminService.createRider(createRiderDto, file.filename);
    }

    // get riders route
    @Get('riders')
    async getRiders(
        @Query('search') search?: string,
        @Query('status') status?: string,
    ): Promise<object> {
        return this.adminService.getRiders(search, status);
    }

    // update rider route
    @Put('riders/:id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateRider(
        @Param('id', ParseIntPipe) riderId: number,
        @Body() updateRiderDto: UpdateRiderDto,
    ): Promise<object> {
        return this.adminService.updateRider(riderId, updateRiderDto);
    }

    // delete rider route
    @Delete('riders/:id')
    async deleteRider(
        @Param('id', ParseIntPipe) riderId: number,
    ): Promise<object> {
        return this.adminService.deleteRider(riderId);
    }

    /* ========== Manage Order ========== */

    // get all order route
    @Get('orders')
    async getOrders(
        @Query('search') search?: string,
        @Query('status') status?: OrderStatus,
        @Query('dateFrom') dateFrom?: Date,
        @Query('dateTo') dateTo?: Date,
    ): Promise<object> {
        return this.adminService.getOrders(search, status, dateFrom, dateTo);
    }

    // get order route
    @Get('orders/:id')
    async getOrder(
        @Param('id', ParseIntPipe) orderId: number,
    ): Promise<object> {
        return this.adminService.getOrder(orderId);
    }

    // cancel order route
    @Patch('orders/:id/cancel')
    async cancelOrder(
        @Param('id', ParseIntPipe) orderId: number,
    ): Promise<object> {
        return this.adminService.cancelOrder(orderId);
    }
}
