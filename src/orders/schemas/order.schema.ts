import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { PricingBreakdown } from '../../cart/dto/pricing-response.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, type: String, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ type: Array, required: true })
  items: Record<string, unknown>[];

  @Prop({ type: Object, required: true })
  pricing: PricingBreakdown;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
