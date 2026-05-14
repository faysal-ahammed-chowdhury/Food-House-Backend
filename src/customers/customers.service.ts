import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../common/entities/customer.entity';
import { OrderEntity } from '../common/entities/order.entity';
import { UserRoles } from '../common/enums/user-roles.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; 
import { CreateOrderDto } from './dto/create-order.dto';
import { RestaurantEntity } from 'src/common/entities/restaurant.entity';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { ILike } from 'typeorm';
import { ItemEntity } from 'src/common/entities/item.entity';


@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>, 
    @InjectRepository(RestaurantEntity) private restaurantRepository: Repository<RestaurantEntity>,
    private readonly mailerService: MailerService,
  ) {}

  async register(createDto: CreateCustomerDto) {
    const existingCustomer = await this.customerRepository.findOne({ where: { user: { email: createDto.email } } });
    if (existingCustomer) {
      throw new BadRequestException('Email is already registered!');
    }
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createDto.password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newCustomer = this.customerRepository.create({
      address: createDto.address,
      phone: createDto.phone,
      isVerified: false, 
      verificationToken: verificationToken, 
      user: {
        name: createDto.name,
        email: createDto.email,
        password: hashedPassword,
        role: UserRoles.CUSTOMER,
      },
    });
    
    const savedCustomer = await this.customerRepository.save(newCustomer);
    
    const frontendUrl = process.env.FRONTEND_URL ;
    const verificationLink = `${frontendUrl}/verify/${savedCustomer.customerId}/${verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: savedCustomer.user.email, 
        subject: 'Verify your FoodHouse Account!',
        text: `Please click here to verify: ${verificationLink}`,
      });
    } catch (error) {
        // Mailer error handling
    }
    
    return { message: "Customer registered successfully. Please check your email to verify your account.", customerId: savedCustomer.customerId };
  }

  async verifyEmail(customerId: number, token: string) {
    const customer = await this.customerRepository.findOne({ where: { customerId } });
    
    if (!customer) throw new BadRequestException('User not found');
    if (customer.isVerified) return { message: 'User is already verified' };
    if (customer.verificationToken !== token) throw new BadRequestException('Invalid or expired verification token');

    customer.isVerified = true;
    customer.verificationToken = ''; 
    await this.customerRepository.save(customer);

    return { message: 'Account successfully verified!' };
  }

  async searchFood(item: string) {
    return { message: `Searching database for food item: ${item}` };
  }

  async searchDatabase(query: string) {
    // 1. Search Restaurants ONLY (Independent Search)
    const restaurants = await this.restaurantRepository.find({
      where: [
        { user: { name: ILike(`%${query}%`) } }, 
        { address: ILike(`%${query}%`) }         
      ],
      relations: ['user'], 
      take: 10,
    });

    // 2. Search Items ONLY (Independent Search)
    // PRO-TIP: We use `.manager.find()` to query the Item table directly!
    const items = await this.restaurantRepository.manager.find(ItemEntity, {
      where: {
        name: ILike(`%${query}%`) // Look for the food name
      },
      // You can even bring the restaurant data along if you want to show it on the UI later!
      relations: ['restaurant', 'restaurant.user'], 
      take: 20,
    });

    // 3. Format the items so the frontend gets 'itemName' exactly as it expects
    const formattedItems = items.map(item => ({
      ...item,
      itemName: item.name,
      // 👇 ADD THIS LINE: Explicitly grab the restaurant ID
      restaurantId: item.restaurant?.restaurantId 
    }));

    // 4. Return the completely decoupled results!
    return {
      restaurants: restaurants,
      items: formattedItems,
    };
  }

  async getProfile(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId: id },
      relations: ['user'], 
    });

    if (!customer) throw new NotFoundException(`Customer #${id} not found`);
    return customer;
  }

  async replaceProfile(id: number, updateDto: UpdateCustomerDto) {
    const customer = await this.getProfile(id); 
    if (updateDto.address) customer.address = updateDto.address;
    if (updateDto.phone) customer.phone = updateDto.phone;
    if (updateDto.name) customer.user.name = updateDto.name;
    
    await this.customerRepository.save(customer);
    return { message: "Profile fully replaced", customer };
  }

  async patchProfile(id: number, updateDto: UpdateCustomerDto) {
    const customer = await this.getProfile(id);
    if (updateDto.address) customer.address = updateDto.address;
    if (updateDto.phone) customer.phone = updateDto.phone;
    if (updateDto.name) customer.user.name = updateDto.name;

    await this.customerRepository.save(customer);
    return { message: "Profile partially updated", customer };
  }

  async checkout(id: number, cartData: any) {
    const customer = await this.getProfile(id);
    console.log("PAYLOAD RECEIVED FROM FRONTEND:", CreateOrderDto);
    const newOrder = this.orderRepository.create({
      customer: customer,
      subtotal: cartData.totalPrice || 0,
      discountAmount: 0,
      deliveryFee: 0,
      total: cartData.totalPrice || 0, 
      status: OrderStatus.PENDING,
      paymentMethod: (CreateOrderDto as any).paymentMethod || PaymentMethod.COD,
      customerName: customer.user.name,
      customerAddress: customer.address || 'Address pending',
      restaurantName: 'Pending Restaurant',
      restaurantAddress: 'Pending Address',
      commissionAmount: 0,
      commissionPercentage: 0,
      estimatedDeliveryTime: 30,
    });

    const savedOrder = await this.orderRepository.save(newOrder);
    return { message: "Order placed successfully", orderId: savedOrder.orderId };
  }

  async getOrders(id: number) {
    const orders = await this.orderRepository.find({
      where: { customer: { customerId: id } },
      relations: ['orderItems'], 
      order: { orderAt: 'DESC' }, 
    });

    const activeStatuses = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.RIDER_ASSIGNED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED];
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

  async cancelOrder(id: number, orderId: number) {
    const order = await this.orderRepository.findOne({ 
      where: { orderId: orderId } 
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);
    return { message: `Order #${orderId} has been successfully cancelled` };
  }

  async placeOrder(customerId: number, createOrderDto: CreateOrderDto) {
    const customer = await this.getProfile(customerId);
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
      subtotal: calculatedSubtotal,
      discountAmount: 0,
      deliveryFee: deliveryFee,
      total: calculatedSubtotal + deliveryFee,
      status: OrderStatus.PENDING,
      paymentMethod: (CreateOrderDto as any).paymentMethod || PaymentMethod.COD,
      customerName: customer.user.name,
      customerAddress: customer.address || 'Address pending',
      restaurantName: (createOrderDto as any).restaurantName || 'Unknown Restaurant',
      restaurantAddress: 'Unknown Address',
      commissionAmount: (calculatedSubtotal * 0.1), 
      commissionPercentage: 10,
      estimatedDeliveryTime: 30,
      orderItems: orderItemsToSave, 
    });

    const savedOrder = await this.orderRepository.save(newOrder);
    delete (savedOrder as any).customer;
    return { message: 'Order placed successfully', order: savedOrder };
  }

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

  //  Get Restaurant Menu for Customer
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