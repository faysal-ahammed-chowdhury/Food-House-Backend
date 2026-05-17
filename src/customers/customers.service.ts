import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; 
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CustomerEntity } from '../common/entities/customer.entity';
import { OrderEntity } from '../common/entities/order.entity';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { ItemEntity } from 'src/common/entities/item.entity';
import { UserRoles } from '../common/enums/user-roles.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>, 
    @InjectRepository(RestaurantEntity) private restaurantRepository: Repository<RestaurantEntity>,
    private readonly mailerService: MailerService,
  ) {}

  //1 - Fetch 5 Restaurants for the Homepage
    async getTop5Restaurants() {
        const restaurants = await this.restaurantRepository.find({
            where: { isOpen: true },
            relations: ['user'],
            take: 5, 
        });

        return restaurants.map(e => ({
            restaurantId: e.restaurantId,
            name: e.user?.name || 'Unknown Restaurant',
            image: e.bannerUrl,
            tags: e.description || "Food • Delicious", 
            currentDeliveryFee: e.currentDeliveryFee,
            isOpen: e.isOpen,
        }));
    }

    //2 - Fetch ALL Restaurants for the RESTURANT PAGE
    async getAllRestaurants() {
        const restaurants = await this.restaurantRepository.find({
            relations: ['user'], 
            order: {
                restaurantId: 'ASC' 
            }
        });

        return restaurants.map(e => ({
            restaurantId: e.restaurantId,
            name: e.user?.name || 'Unknown Restaurant',
            image: e.bannerUrl,
            tags: e.description || "Food • Delicious", 
            currentDeliveryFee: e.currentDeliveryFee,
            isOpen: e.isOpen,
        }));
    }


  // 3 - Search for food items or restaurants
  async searchDatabase(query: string) {
    const restaurants = await this.restaurantRepository.find({
      where: [
        { user: { name: ILike(`%${query}%`) } }, 
        { address: ILike(`%${query}%`) }         
      ],
      relations: ['user'], 
      take: 10,
    });

    const items = await this.restaurantRepository.manager.find(ItemEntity, {
      where: { name: ILike(`%${query}%`) },
      relations: ['restaurant', 'restaurant.user'], 
      take: 20,
    });

    const formattedItems = items.map(item => ({
      ...item,
      itemName: item.name,
      restaurantId: item.restaurant?.restaurantId 
    }));

    return {
      restaurants: restaurants,
      items: formattedItems,
    };
  }

  // 4 - Get customer profile
  async getProfile(userId: number) {
    const customer = await this.customerRepository.findOne({
      where: { user: { userId: userId } }, 
      relations: ['user'], 
    });

    if (!customer) {
      throw new NotFoundException(`Customer profile for logged-in user not found`);
    }

    if (customer.user) {
      delete (customer.user as any).password;
      delete (customer.user as any).verificationToken;
    }

    return customer;
  }

  // 5 - Update customer password
  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const { newPassword, confirmPassword } = updatePasswordDto;

    if (!newPassword || newPassword.trim() === "") {
      throw new BadRequestException('New password is required');
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const customer = await this.getProfile(userId);
    if (!customer) throw new NotFoundException('Customer not found');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    customer.user.password = hashedPassword;
    await this.customerRepository.save(customer);

    return { message: 'Password updated successfully' };
  }

  // 6 - Replace entire customer profile (PUT)
  async replaceProfile(userId: number, updateDto: UpdateCustomerDto) {
    const customer = await this.getProfile(userId);
    if (updateDto.address) customer.address = updateDto.address;
    if (updateDto.phone) customer.phone = updateDto.phone;
    if (updateDto.name) customer.user.name = updateDto.name;
    
    await this.customerRepository.save(customer);
    return { message: "Profile fully replaced", customer };
  }

  // 7 - Partially update customer profile (PATCH)
  async patchProfile(userId: number, updateDto: UpdateCustomerDto) {
    const customer = await this.getProfile(userId);
    if (updateDto.address) customer.address = updateDto.address;
    if (updateDto.phone) customer.phone = updateDto.phone;
    if (updateDto.name) customer.user.name = updateDto.name;

    await this.customerRepository.save(customer);
    return { message: "Profile partially updated", customer };
  }

  // 8 - Place an order for the logged-in customer
  async placeOrder(userId: number, createOrderDto: CreateOrderDto) {
    const customer = await this.getProfile(userId);
    
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurantId: createOrderDto.restaurantId },
      relations: ['user'] 
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${createOrderDto.restaurantId} not found`);
    }

    let calculatedSubtotal = 0;
    
    const orderItemsToSave = createOrderDto.items.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      calculatedSubtotal += itemTotal; 
      return { 
        itemId: item.itemId || 1, 
        itemName: item.foodName || 'Unknown Item', 
        itemPrice: item.price,
        quantity: item.quantity, 
        total: itemTotal 
      };
    });
    const deliveryFee = 50; 
    
    const newOrder = this.orderRepository.create({
      customer: customer,
      restaurant: restaurant, 
      subtotal: calculatedSubtotal,
      discountAmount: 0,
      deliveryFee: deliveryFee,
      total: calculatedSubtotal + deliveryFee,
      status: OrderStatus.PENDING,
      paymentMethod: (createOrderDto as any).paymentMethod || PaymentMethod.COD,
      customerName: customer.user.name,
      customerAddress: customer.address || 'Address pending',
      restaurantName: restaurant.user?.name || createOrderDto.restaurantName,
      restaurantAddress: restaurant.address || 'Address pending',
      commissionAmount: (calculatedSubtotal * 0.1), 
      commissionPercentage: 10,
      estimatedDeliveryTime: 30,
      orderItems: orderItemsToSave, 
    });
    const savedOrder = await this.orderRepository.save(newOrder);
    delete (savedOrder as any).customer;
    delete (savedOrder as any).restaurant; 
    
    return { message: 'Order placed successfully', order: savedOrder };
  }

  // 9 - Get logged-in user's orders
  async getOrders(userId: number) {
    const customer = await this.getProfile(userId);

    const orders = await this.orderRepository.find({
      where: { customer: { customerId: customer.customerId } },
      relations: ['orderItems'], 
      order: { orderAt: 'DESC' }, 
    });

    const activeStatuses = [
      OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.RIDER_ASSIGNED, 
      OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED
    ];
    const pastStatuses = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

    const formattedOrders = orders.map((order) => {
      const itemsString = order.orderItems && order.orderItems.length > 0
        ? order.orderItems.map((item) => `${item.quantity}x ${item.itemName}`).join(', ') 
        : 'Items not found';

      return {
        orderId: order.orderId.toString(),
        restaurant: order.restaurantName || 'Unknown Restaurant',
        items: itemsString,
        total: order.total,
        status: order.status,
        maxPrepTime: order.estimatedDeliveryTime || 0,
        orderAt: order.orderAt,
      };
    });

    return {
      activeOrders: formattedOrders.filter(o => activeStatuses.includes(o.status as any)),
      pastOrders: formattedOrders.filter(o => pastStatuses.includes(o.status as any)),
    };
  }

  // 10 - Get details of a specific order
  async getOrderDetails(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { orderId: orderId },
      relations: ['orderItems', 'customer', 'restaurant', 'delivery'], 
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} was not found`);
    }
    return order;
  }

  // 11 - Cancel an order
  async cancelOrder(userId: number, orderId: number) {
    const customer = await this.getProfile(userId);
    const order = await this.orderRepository.findOne({ 
      where: { 
        orderId: orderId,
        customer: { customerId: customer.customerId } 
      } 
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found or you do not have permission to cancel it.`);
    }
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(`This order cannot be cancelled in its current state.`);
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);
    
    return { message: `Order #${orderId} has been successfully cancelled` };
  }

  // 12 - Get restaurant menu
  async getRestaurantMenu(restaurantId: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurantId: restaurantId },
      relations: ['user', 'items', 'categories', 'items.category'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${restaurantId} not found`);
    }
    
    const { password, ...safeUserInfo } = restaurant.user;
    
    return {
      ...restaurant, 
      user: safeUserInfo
    };
  }
}