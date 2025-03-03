import {
  AfterUpdate,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product.image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    type: UUID,
    format: 'uuid',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description: 'Product Description',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product Slug',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 1,
    description: 'Product Stock',
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Product Size',
    uniqueItems: true,
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product Gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.title
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }

  @AfterUpdate()
  checkSlugUpdate() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.title
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }
}
