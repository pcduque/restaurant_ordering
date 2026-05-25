import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  create(order: Order): Promise<Order> {
    return this.orderModel.create(order);
  }

  findById(orderId: string): Promise<Order | null> {
    return this.orderModel.findById(orderId).lean<Order>().exec();
  }

  findByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean<Order[]>()
      .exec();
  }
}
