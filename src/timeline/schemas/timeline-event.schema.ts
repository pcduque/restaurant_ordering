import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TimelineEventSource, TimelineEventType } from '../../common/enums/timeline.enum';

export type TimelineEventDocument = HydratedDocument<TimelineEvent>;

@Schema({ timestamps: false })
export class TimelineEvent {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: String, enum: TimelineEventType })
  type: TimelineEventType;

  @Prop({ required: true, type: String, enum: TimelineEventSource })
  source: TimelineEventSource;

  @Prop({ required: true })
  correlationId: string;

  @Prop({ type: Object, default: {} })
  payload: Record<string, unknown>;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);
TimelineEventSchema.index({ orderId: 1, timestamp: 1 });
