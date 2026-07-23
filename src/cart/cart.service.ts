import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductService } from '../product/product.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: {
        items: {
          product: {
            category: true,
          },
        },
      },
    });

    if (!cart) {
      cart = this.cartRepo.create({ userId });
      cart = await this.cartRepo.save(cart);
      cart = await this.cartRepo.findOne({
        where: { userId },
        relations: {
          items: {
            product: {
              category: true,
            },
          },
        },
      }) as Cart;
    }

    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    let originalTotal = 0; 
    let discountTotal = 0;

    const items = cart.items.map((item) => {
      const product = item.product;
      const price = Number(product.price);
      const discount = Number(product.discountPercent);
      const finalPrice = price * (1 - discount / 100);

      const itemOriginalTotal = price * item.quantity;
      const itemDiscountAmount = (price - finalPrice) * item.quantity;
      const itemFinalTotal = finalPrice * item.quantity;

      originalTotal += itemOriginalTotal;
      discountTotal += itemDiscountAmount;

      const firstImage = product.images && product.images.length > 0
        ? product.images[0]
        : null;

      return {
        id: item.id,
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          measure: product.measure,
          image: firstImage,
        },
        quantity: item.quantity,
        price: price,
        discountPercent: discount,
        discountDisplay: discount > 0 ? `${Math.round(discount)}%` : '۰%',
        finalPrice: Math.round(finalPrice),
        totalPrice: Math.round(itemFinalTotal), 
      };
    });

    const finalTotal = originalTotal - discountTotal;

    return {
      id: cart.id,
      items,
      originalTotal: Math.round(originalTotal),
      discountTotal: Math.round(discountTotal),
      finalTotal: Math.round(finalTotal),
      itemCount: items.length,
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const { productId, quantity = 1 } = dto;

    const product = await this.productService.findOneEntity(productId);
    if (!product.isActive) {
      throw new BadRequestException('این محصول غیرفعال است');
    }

    const cart = await this.getOrCreateCart(userId);

    let existingItem = await this.cartItemRepo.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemRepo.save(existingItem);
    } else {
      const newItem = this.cartItemRepo.create({
        cartId: cart.id,
        productId,
        quantity,
      });
      await this.cartItemRepo.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: { product: true },
    });
    if (!item) {
      throw new NotFoundException('آیتم در سبد خرید یافت نشد');
    }

    item.quantity = Number(dto.quantity);
    await this.cartItemRepo.save(item);

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
    };
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new NotFoundException('آیتم در سبد خرید یافت نشد');
    }

    await this.cartItemRepo.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepo.delete({ cartId: cart.id });
    return this.getCart(userId);
  }

  async getCartProductIds(userId: string, productIds: string[]): Promise<Set<string>> {
    if (!userId || !productIds || productIds.length === 0) {
      return new Set();
    }

    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: true },
    });

    if (!cart) {
      return new Set();
    }

    const cartItems = await this.cartItemRepo.find({
      where: {
        cartId: cart.id,
        productId: In(productIds),
      },
      select: {
        productId: true,
      },
    });

    return new Set(cartItems.map((item) => item.productId));
  }
}