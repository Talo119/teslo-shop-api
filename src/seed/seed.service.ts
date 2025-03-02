import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async runSeed() {
    await this.insertNewProducts();
    const adminUser = await this.insertUsers();
    const products = initialData.products;

    const insertPromises = products.map((product) =>
      this.productService.create(product, adminUser),
    );

    await Promise.all(insertPromises);

    return `Seed executted`;
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    return true;
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    await this.userRepository.save(users);
    return users[0];
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();
    return true;
  }
}
