import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;
  @Column('text', {
    nullable: false,
  })
  password: string;
  @Column('text', {
    nullable: false,
    select: false,
  })
  fullName: string;
  @Column('bool', {
    default: true,
  })
  isActive: boolean;
  @Column('text', {
    array: true,
    default: [],
  })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
