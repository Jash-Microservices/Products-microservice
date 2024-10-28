import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ProductsService')

  onModuleInit() {
    this.$connect()
    this.logger.log('Database connected')
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    })
  }

  async findAll({ page, limit }: PaginationDto) {

    const totalProducts = await this.product.count({ where: { available: true }})
    const lastPage = Math.ceil( totalProducts / limit )

    return {
      data: await this.product.findMany({
        take: limit,
        skip: ( page - 1 ) * limit,
        where: { available: true }
      }),
      meta: {
        page,
        totalProducts,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id,
        available: true
      }
    })

    if ( !product ) throw new NotFoundException(`Product with id ${id} not found`)

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: _, ...data } = updateProductDto
  
    await this.findOne(id)

    const productUpdated = await this.product.update({
      where: { id },
      data
    });

    return productUpdated
  }

  async remove(id: number) {

    const product = await this.findOne(id)

    // await this.product.delete({
    //   where: { id }
    // })

    await this.product.update({
      where: { id },
      data: {
        available: false
      }
    })
    return product
  }
}
