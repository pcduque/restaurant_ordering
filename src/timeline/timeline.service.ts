import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  TimelineEventSource,
  TimelineEventType,
} from '../common/enums/timeline.enum';
import {
  isPayloadWithinLimit,
  MAX_TIMELINE_PAYLOAD_BYTES,
} from '../common/utils/payload-size.util';
import { TimelineEvent } from './schemas/timeline-event.schema';
import { TimelineRepository } from './timeline.repository';

interface AppendEventInput {
  eventId?: string;
  orderId: string;
  userId: string;
  type: TimelineEventType;
  source: TimelineEventSource;
  correlationId: string;
  payload: Record<string, unknown>;
  timestamp?: Date;
}

@Injectable()
export class TimelineService {
  constructor(private readonly timelineRepository: TimelineRepository) {}

  async appendEvent(input: AppendEventInput): Promise<TimelineEvent> {
    if (!isPayloadWithinLimit(input.payload)) {
      throw new BadRequestException(
        `Timeline event payload must be <= ${MAX_TIMELINE_PAYLOAD_BYTES} bytes`,
      );
    }

    return this.timelineRepository.append({
      eventId: input.eventId ?? uuidv4(),
      timestamp: input.timestamp ?? new Date(),
      orderId: input.orderId,
      userId: input.userId,
      type: input.type,
      source: input.source,
      correlationId: input.correlationId,
      payload: input.payload,
    });
  }

  async getOrderTimeline(
    orderId: string,
    user: AuthenticatedUser,
    pageSize = 20,
    cursor?: string,
  ) {
    if (pageSize > 50) {
      throw new BadRequestException(
        'pageSize must be less than or equal to 50',
      );
    }
    if (pageSize < 1) {
      throw new BadRequestException('pageSize must be greater than 0');
    }

    const events = await this.timelineRepository.findByOrder(
      orderId,
      user.userId,
      pageSize,
      cursor,
    );
    const page = events.slice(0, pageSize);
    const nextCursor =
      events.length > pageSize
        ? page[page.length - 1]?.timestamp.toISOString()
        : null;

    return {
      items: page.map((event) => ({
        ...event,
        timestamp: event.timestamp.toISOString(),
      })),
      nextCursor,
      pageSize,
    };
  }
}
