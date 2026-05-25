import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimelineEvent, TimelineEventDocument } from './schemas/timeline-event.schema';

@Injectable()
export class TimelineRepository {
  constructor(@InjectModel(TimelineEvent.name) private readonly eventModel: Model<TimelineEventDocument>) {}

  async append(event: TimelineEvent): Promise<TimelineEvent> {
    try {
      return await this.eventModel.create(event);
    } catch (error) {
      if (error?.code === 11000) {
        const existing = await this.eventModel.findOne({ eventId: event.eventId }).lean<TimelineEvent>().exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async findByOrder(orderId: string, pageSize: number, cursor?: string): Promise<TimelineEvent[]> {
    const query = cursor ? { orderId, timestamp: { $gt: new Date(cursor) } } : { orderId };
    return this.eventModel.find(query).sort({ timestamp: 1 }).limit(pageSize + 1).lean<TimelineEvent[]>().exec();
  }
}
