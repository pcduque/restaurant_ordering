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

  findById(productId: string): Promise<Product | null> {
    return this.productModel.findById(productId).lean<Product>().exec();
  }

  findByIds(productIds: string[]): Promise<Product[]> {
    return this.productModel.find({ _id: { $in: productIds } }).lean<Product[]>().exec();
  }

  create(product: Product): Promise<Product> {
    return this.productModel.create(product).then((created) => created.toObject());
  }

  update(productId: string, product: Partial<Product>): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(productId, { $set: product }, { new: true })
      .lean<Product>()
      .exec();
  }

  delete(productId: string): Promise<Product | null> {
    return this.productModel.findByIdAndDelete(productId).lean<Product>().exec();
  }
}
