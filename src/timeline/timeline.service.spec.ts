import { BadRequestException } from '@nestjs/common';
import { TimelineEventSource, TimelineEventType } from '../common/enums/timeline.enum';
import { TimelineService } from './timeline.service';

describe('TimelineService', () => {
  function createService() {
    const events = [];
    const repository = {
      append: jest.fn(async (event) => {
        const existing = events.find((item) => item.eventId === event.eventId);
        if (existing) {
          return existing;
        }
        events.push(event);
        return event;
      }),
      findByOrder: jest.fn(async (orderId: string, pageSize: number, cursor?: string) =>
        events
          .filter((event) => event.orderId === orderId && (!cursor || event.timestamp > new Date(cursor)))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .slice(0, pageSize + 1),
      ),
    };
    return { service: new TimelineService(repository as never), repository };
  }

  it('rejects payload over 16KB', async () => {
    const { service } = createService();
    await expect(
      service.appendEvent({
        orderId: 'order-1',
        userId: 'mock-user-1',
        type: TimelineEventType.ORDER_PLACED,
        source: TimelineEventSource.API,
        correlationId: 'corr-1',
        payload: { value: 'x'.repeat(17 * 1024) },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deduplicates by eventId', async () => {
    const { service, repository } = createService();
    const input = {
      eventId: 'event-1',
      orderId: 'order-1',
      userId: 'mock-user-1',
      type: TimelineEventType.ORDER_PLACED,
      source: TimelineEventSource.API,
      correlationId: 'corr-1',
      payload: {},
    };

    await service.appendEvent(input);
    await service.appendEvent(input);

    expect(repository.append).toHaveBeenCalledTimes(2);
    const page = await service.getOrderTimeline('order-1');
    expect(page.items).toHaveLength(1);
  });

  it('returns events sorted by timestamp', async () => {
    const { service } = createService();
    await service.appendEvent({
      eventId: 'event-2',
      orderId: 'order-1',
      userId: 'mock-user-1',
      type: TimelineEventType.ORDER_STATUS_CHANGED,
      source: TimelineEventSource.API,
      correlationId: 'corr-1',
      payload: {},
      timestamp: new Date('2026-01-02T00:00:00.000Z'),
    });
    await service.appendEvent({
      eventId: 'event-1',
      orderId: 'order-1',
      userId: 'mock-user-1',
      type: TimelineEventType.ORDER_PLACED,
      source: TimelineEventSource.API,
      correlationId: 'corr-1',
      payload: {},
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
    });

    const page = await service.getOrderTimeline('order-1');
    expect(page.items.map((event) => event.eventId)).toEqual(['event-1', 'event-2']);
  });
});
