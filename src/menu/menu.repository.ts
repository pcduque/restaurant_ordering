import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class MenuRepository {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  findAll(): Promise<Product[]> {
    return this.productModel.find().sort({ _id: 1 }).lean<Product[]>().exec();
  }

  findByIds(productIds: string[]): Promise<Product[]> {
    return this.productModel.find({ _id: { $in: productIds } }).lean<Product[]>().exec();
  }
}
