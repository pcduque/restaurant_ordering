import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IdempotencyKeyDocument = HydratedDocument<IdempotencyKey>;

@Schema({ timestamps: true })
export class IdempotencyKey {
  @Prop({ required: true, index: true })
  key: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop()
  orderId?: string;

  @Prop()
  correlationId?: string;
}

export const IdempotencyKeySchema =
  SchemaFactory.createForClass(IdempotencyKey);
IdempotencyKeySchema.index({ key: 1, userId: 1 }, { unique: true });
