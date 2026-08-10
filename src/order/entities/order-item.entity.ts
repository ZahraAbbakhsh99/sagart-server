import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column()
  orderId!: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  priceAtOrder!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentAtOrder!: number;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  finalPriceAtOrder!: number;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  totalPriceAtOrder!: number;
}