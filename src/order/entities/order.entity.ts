import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Address } from '../../address/entities/address.entity';
import { OrderItem } from './order-item.entity';
import { ShippingMethod } from '../../shipping/entities/shipping-setting.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'addressId' })
  address!: Address;

  @Column()
  addressId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  totalPrice!: number; 

  @Column({ type: 'decimal', precision: 10, scale: 0, default: 0 })
  discountAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  finalPrice!: number; 

  @Column({ type: 'decimal', precision: 10, scale: 0, default: 0 })
  shippingCost!: number;

  @Column({ type: 'enum', enum: ShippingMethod, default: ShippingMethod.NORMAL })
  shippingMethod!: ShippingMethod;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ nullable: true })
  trackingCode!: string;

  @Column({ nullable: true })
  paymentMethod!: string; // 'zarinpal'

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}