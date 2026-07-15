import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  price!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent!: number;

  priceAfterDiscount!: number;

  @Column()
  measure!: string; 

  @Column({ type: 'decimal', precision: 10, scale: 0, default: 0 })
  weight!: number;

  @Column({ type: 'json', nullable: true })
  images!: string[];

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  harvestMethod!: string;

  @Column({ type: 'text', nullable: true })
  storageMethod!: string;

  @Column({ type: 'text', nullable: true })
  specifications!: string;

  @Column({ type: 'text', nullable: true })
  packagingShipping!: string;

  @Column({ type: 'text', nullable: true })
  usageGuide!: string;

  @Column({ type: 'float', default: 0 })
  rating!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column()
  categoryId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @AfterLoad()
  calculatePriceAfterDiscount() {
    this.priceAfterDiscount = this.discountPercent && this.discountPercent > 0
      ? this.price * (1 - this.discountPercent / 100)
      : this.price;
  }
}