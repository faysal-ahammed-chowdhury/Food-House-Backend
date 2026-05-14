import { 
  Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, 
  UsePipes, ValidationPipe, ParseIntPipe, UseGuards, Req,
  UnauthorizedException
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  
  //1 - top 5 resturants
  @Get('top-restaurants')
  async getTop5Restaurants() {
    return this.customersService.getTop5Restaurants();
  }
  //2 - all resturants
  @Get('all-restaurants')
  async getAllRestaurants() {
    return this.customersService.getAllRestaurants();
  }

  //3 - Search for food items or restaurants
  @Get('search')
  async searchDatabase(@Query('query') query: string) {
    if (!query) return { restaurants: [], items: [] };
    return await this.customersService.searchDatabase(query);
  }

  //4 - Get customer profile
  @UseGuards(AuthGuard) 
  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException("Your session is outdated. Please log in again.");
    }
    return await this.customersService.getProfile(userId); 
  }
  
  //5 - Update customer password
  @UseGuards(AuthGuard) 
  @Patch('password')
  @UsePipes(new ValidationPipe())
  async updatePassword(@Req() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
   return await this.customersService.updatePassword(req.user.userId, updatePasswordDto);
  }

  //6 - Replace entire customer profile (PUT) - requires full data
  @UseGuards(AuthGuard)
  @Put('profile')
  @UsePipes(new ValidationPipe())
  async replaceProfile(@Req() req: any, @Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customersService.replaceProfile(req.user.userId, updateCustomerDto);
  }

  //7 - Partially update customer profile (PATCH) - allows partial data
  @UseGuards(AuthGuard) 
  @Patch('profile')
  @UsePipes(new ValidationPipe())
  async patchProfile(@Req() req: any, @Body() updateCustomerDto: UpdateCustomerDto) {
    return await this.customersService.patchProfile(req.user.userId, updateCustomerDto);
  }

  // 8 - Place an order for the logged-in customer
  @UseGuards(AuthGuard)
  @Post('orders')
  async placeOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException("Your session is outdated. Please log in again.");
    }
    return await this.customersService.placeOrder(userId, createOrderDto);
  }

  // 9 - Get logged-in user's orders
  @UseGuards(AuthGuard)
  @Get('orders')
  async getOrders(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException("Your session is outdated. Please log out and log in again.");
    }
    return await this.customersService.getOrders(userId);
  }

  // 10 - Get details of a specific order
  @UseGuards(AuthGuard)
  @Get('orders/:orderId')
  async checkOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.customersService.getOrderDetails(orderId);
  }

  // 11 - Cancel an order
  @UseGuards(AuthGuard)
  @Delete('orders/:orderId')
  async cancelOrder(@Req() req: any, @Param('orderId', ParseIntPipe) orderId: number) {
    return await this.customersService.cancelOrder(req.user.userId, orderId);
  }

  // 12 - Get restaurant menu
  @Get('restaurant-menu/:id')
  async getRestaurantMenu(@Param('id', ParseIntPipe) id: number) {
    return await this.customersService.getRestaurantMenu(id);
  }
}