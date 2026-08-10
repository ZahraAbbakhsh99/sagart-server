import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ShippingMethod {
  NORMAL = 'normal',
  EXPRESS = 'express',
}

@Entity('shipping_settings')
export class ShippingSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ShippingMethod })
  method!: ShippingMethod;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  minWeight!: number; 

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  maxWeight!: number; 

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  cost!: number; 

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}