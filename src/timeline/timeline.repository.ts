import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TimelineEvent,
  TimelineEventDocument,
} from './schemas/timeline-event.schema';

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

@Injectable()
export class TimelineRepository {
  constructor(
    @InjectModel(TimelineEvent.name)
    private readonly eventModel: Model<TimelineEventDocument>,
  ) {}

  async append(event: TimelineEvent): Promise<TimelineEvent> {
    try {
      return await this.eventModel.create(event);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const existing = await this.eventModel
          .findOne({ eventId: event.eventId })
          .lean<TimelineEvent>()
          .exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  async findByOrder(
    orderId: string,
    userId: string,
    pageSize: number,
    cursor?: string,
  ): Promise<TimelineEvent[]> {
    const query = cursor
      ? { orderId, userId, timestamp: { $gt: new Date(cursor) } }
      : { orderId, userId };
    return this.eventModel
      .find(query)
      .sort({ timestamp: 1 })
      .limit(pageSize + 1)
      .lean<TimelineEvent[]>()
      .exec();
  }

  async findByUser(
    userId: string,
    pageSize: number,
    cursor?: string,
  ): Promise<TimelineEvent[]> {
    const query = cursor
      ? { userId, timestamp: { $lt: new Date(cursor) } }
      : { userId };
    return this.eventModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(pageSize + 1)
      .lean<TimelineEvent[]>()
      .exec();
  }
}
