import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { ShippingService } from '../shipping/shipping.service';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JalaliDateUtil } from '../common/jalali';
// import { DiscountService } from '../discount/discount.service';

type OrderItemInput = {
  productId: string;
  quantity: number;
  priceAtOrder: number;
  discountPercentAtOrder: number;
  finalPriceAtOrder: number;
  totalPriceAtOrder: number;
};

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private cartService: CartService,
    private addressService: AddressService,
    private shippingService: ShippingService,
    private productService: ProductService,
    // private discountService: DiscountService,
  ) {}

  private mapToResponse(order: Order) {
    return {
      id: order.id,
      userId: order.userId,
      addressId: order.addressId,
      address: order.address
        ? {
            fullName: order.address.fullName,
            phone: order.address.phone,
            province: order.address.province,
            city: order.address.city,
            address: order.address.address,
            postalCode: order.address.postalCode,
          }
        : null,
      totalPrice: Number(order.totalPrice),
      discountAmount: Number(order.discountAmount),
      finalPrice: Number(order.finalPrice),
      shippingCost: Number(order.shippingCost),
      shippingMethod: order.shippingMethod,
      status: order.status,
      trackingCode: order.trackingCode,
      paidAt: order.paidAt      ? JalaliDateUtil.toJalali(order.paidAt, 'jDD jMMMM jYYYY - HH:mm'): null,
      items: order.items?.map((item) => ({
        id: item.id,
        productId: item.productId, 
        product: item.product
          ? {
              id: item.product.id,
              title: item.product.title,
              slug: item.product.slug,
              measure: item.product.measure,
              image:
                item.product.images && item.product.images.length > 0
                  ? item.product.images[0]
                  : null,
            }
          : null,
        quantity: item.quantity,
        priceAtOrder: Number(item.priceAtOrder),
        discountPercentAtOrder: Number(item.discountPercentAtOrder),
        finalPriceAtOrder: Number(item.finalPriceAtOrder),
        totalPriceAtOrder: Number(item.totalPriceAtOrder),
      })),
      createdAt: JalaliDateUtil.toJalali(order.createdAt, 'jDD jMMMM jYYYY - HH:mm'),
    updatedAt: JalaliDateUtil.toJalali(order.updatedAt, 'jDD jMMMM jYYYY - HH:mm'),
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('سبد خرید خالی است');
    }

    const address = await this.addressService.findOne(dto.addressId, userId);

    let totalWeight = 0;
    for (const item of cart.items) {
      const product = await this.productService.findOneEntity(item.productId);
      totalWeight += product.weight * item.quantity;
    }

    const shippingCost = await this.shippingService.getShippingCost(
      totalWeight,
      dto.shippingMethod,
    );

    let totalPriceNum = 0;
    const orderItems: OrderItemInput[] = [];

    for (const item of cart.items) {
      const product = await this.productService.findOneEntity(item.productId);
      const price = Number(product.price);
      const discount = Number(product.discountPercent);
      const finalPrice = price * (1 - discount / 100);
      const totalItemPrice = finalPrice * item.quantity;

      totalPriceNum += price * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: price,
        discountPercentAtOrder: discount,
        finalPriceAtOrder: finalPrice,
        totalPriceAtOrder: totalItemPrice,
      });
    }

    let discountAmount = 0;
    // if (dto.discountCode) {
    //   discountAmount = await this.discountService.apply(dto.discountCode, userId, totalPrice);
    // }
    const shippingCostNum = Number(shippingCost);
    const finalPrice = totalPriceNum - discountAmount + shippingCostNum;

    const order = this.orderRepo.create({
      userId,
      addressId: dto.addressId,
      totalPrice: totalPriceNum, 
      discountAmount: discountAmount,
      finalPrice: finalPrice,        
      shippingCost: shippingCostNum, 
      shippingMethod: dto.shippingMethod,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    for (const item of orderItems) {
      const orderItem = this.orderItemRepo.create({
        orderId: savedOrder.id,
        ...item,
      });
      await this.orderItemRepo.save(orderItem);
    }

    await this.cartService.clearCart(userId);

    return this.findOne(savedOrder.id, userId);
  }

  async findAll(userId: string) {
    const orders = await this.orderRepo.find({
      where: { userId },
      relations: {
        address: true,
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => {
      const images: string[] = [];
      for (const item of order.items || []) {
        const productImages = item.product?.images || [];
        if (productImages.length > 0) {
          images.push(productImages[0]); 
        }
        if (images.length >= 4) break; 
      }

      return {
        id: order.id,
        status: order.status,
        createdAt: JalaliDateUtil.toJalali(order.createdAt, 'jDD jMMMM jYYYY'),
        finalPrice: Number(order.finalPrice),
        shippingMethod: order.shippingMethod,
        itemCount: order.items?.length || 0,
        images,
        address: {
          province: order.address?.province,
          city: order.address?.city,
        },
      };
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id, userId },
      relations: {
        address: true,
        items: {
          product: true,
        },
      },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return this.mapToResponse(order);
  }

  async findOneForAdmin(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        user: true,
        address: true,
        items: {
          product: true,
        },
      },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return {
      ...this.mapToResponse(order),
      user: {
        id: order.user.id,
        fullName: order.user.fullName,
        phone: order.user.phone,
      },
    };
  }

  async findAllForAdmin(
    status?: OrderStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      relations: {
        user: true,
        address: true,
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const formattedItems = items.map((order) => ({
      id: order.id,
      userId: order.userId,
      user: {
        fullName: order.user.fullName || 'کاربر گرامی',
        phone: order.user.phone,
      },
      address: {
        fullName: order.address.fullName,
        phone: order.address.phone,
        province: order.address.province,
        city: order.address.city,
      },
      totalPrice: Number(order.totalPrice),
      discountAmount: Number(order.discountAmount),
      finalPrice: Number(order.finalPrice),
      shippingCost: Number(order.shippingCost),
      shippingMethod: order.shippingMethod,
      status: order.status,
      trackingCode: order.trackingCode,
      createdAt: JalaliDateUtil.toJalali(order.createdAt, 'jDD jMMMM jYYYY - HH:mm'),
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
      },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    if (dto.trackingCode) {
      order.trackingCode = dto.trackingCode;
    }

    if (dto.status === OrderStatus.PAID && order.status !== OrderStatus.PAID) {
      order.paidAt = new Date();
    }
    order.status = dto.status;
    await this.orderRepo.save(order);

    return this.findOneForAdmin(id);
  }

  async cancelOrder(id: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id, userId },
      relations: {
        items: {
          product: true,
        },
      },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('این سفارش قابل لغو نیست');
    }

    for (const item of order.items) {
      await this.cartService.addItem(userId, {
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    order.status = OrderStatus.CANCELED;
    await this.orderRepo.save(order);

    return {
      message: 'سفارش با موفقیت لغو شد و محصولات به سبد خرید بازگردانده شدند',
    };
  }
}