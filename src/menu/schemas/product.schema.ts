import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class ModifierOption {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  priceCents: number;
}

@Schema({ _id: false })
export class ModifierGroup {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  required: boolean;

  @Prop({ required: true, min: 0 })
  minSelections: number;

  @Prop({ required: true, min: 1 })
  maxSelections: number;

  @Prop({ type: [ModifierOption], default: [] })
  options: ModifierOption[];
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  basePriceCents: number;

  @Prop({ type: [ModifierGroup], default: [] })
  modifierGroups: ModifierGroup[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
