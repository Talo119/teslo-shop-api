import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product Title',
    nullable: false,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;
  @ApiProperty({
    description: 'Product Price',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
  @ApiProperty({
    description: 'Product Description',
  })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({
    description: 'Product Slug',
  })
  @IsString()
  @IsOptional()
  slug?: string;
  @ApiProperty({
    description: 'Product Stock',
  })
  @IsInt()
  @IsPositive()
  stock?: number;
  @ApiProperty({
    description: 'Product Size',
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];
  @ApiProperty({
    description: 'Product Tags',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];
  @ApiProperty({
    description: 'Product Images',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
  @ApiProperty({
    description: 'Product Gender',
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;
}
