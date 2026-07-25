import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string;

  @Column({ type: 'jsonb' })
  content!: any; 

  @Column({ nullable: true })
  featuredImage!: string;

  @Column({ nullable: true })
  videoUrl!: string;

  @Column({ type: 'int', default: 0 })
  readingTime!: number; //min

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status!: ArticleStatus;

  @Column({ default: 0 })
  views!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column({ nullable: true })
  authorId!: string;

  @ManyToMany(() => Product, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'article_products',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}