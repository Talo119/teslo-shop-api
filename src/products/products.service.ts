import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const newProduct = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImagesRepository.create({ url: image }),
        ),
        user,
      });
      await this.productRepository.save(newProduct);
      return { ...newProduct, images };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });
      return products.map(({ images, ...rest }) => ({
        ...rest,
        images: images.map((img) => img.url),
      }));
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findOne(term: string) {
    try {
      let product: Product;
      if (isUUID(term)) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product = await queryBuilder
          .where('UPPER(title) =:title or slug =:slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase(),
          })
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
      }

      if (!product) {
        throw new NotFoundException(`Product with: ${term} not found.`);
      }
      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findOnePlane(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const { images, ...toUpdate } = updateProductDto;

      const product = await this.productRepository.preload({
        id,
        ...toUpdate,
      });
      if (!product) {
        throw new NotFoundException(`Product with id: ${id} not found`);
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImagesRepository.create({ url: image }),
        );
      }

      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();

      return this.findOnePlane(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
      return true;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }

  private handleDBException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException();
  }
}
