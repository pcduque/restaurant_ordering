/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../common/enums/order-status.enum';
import {
  TimelineEventSource,
  TimelineEventType,
} from '../common/enums/timeline.enum';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('Orders', () => {
  const user = { userId: 'user-1', username: 'demo' };

  function createService() {
    const idempotency = new Map();
    const pricingService = {
      priceCart: jest.fn(async () => ({
        items: [],
        subtotalCents: 100,
        taxCents: 8,
        serviceFeeCents: 250,
        totalCents: 358,
      })),
    };
    const ordersRepository = {
      create: jest.fn(async (order) => order),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    const idempotencyService = {
      find: jest.fn(
        async (key, userId) => idempotency.get(`${userId}:${key}`) ?? null,
      ),
      reserve: jest.fn(async (key, userId) => {
        const record = { key, userId };
        idempotency.set(`${userId}:${key}`, record);
        return record;
      }),
      complete: jest.fn(async (key, userId, orderId, correlationId) => {
        idempotency.set(`${userId}:${key}`, {
          key,
          userId,
          orderId,
          correlationId,
        });
      }),
    };
    const timelineService = { appendEvent: jest.fn(async (event) => event) };
    const service = new OrdersService(
      pricingService as never,
      ordersRepository as never,
      idempotencyService as never,
      timelineService as never,
    );
    return { service, ordersRepository, timelineService };
  }

  const dto = { items: [{ productId: 'fries', quantity: 1, modifiers: [] }] };

  it('supports Idempotency-Key', async () => {
    const { service, ordersRepository } = createService();
    const response = await service.createOrder(dto, 'test-key-123', user);

    expect(response.status).toBe(OrderStatus.PLACED);
    expect(response.orderId).toBeDefined();
    expect(ordersRepository.create).toHaveBeenCalledTimes(1);
  });

  it('same key returns same orderId', async () => {
    const { service, ordersRepository } = createService();
    const first = await service.createOrder(dto, 'same-key', user);
    const second = await service.createOrder(dto, 'same-key', user);

    expect(second.orderId).toBe(first.orderId);
    expect(ordersRepository.create).toHaveBeenCalledTimes(1);
  });

  it('persists cart events with the checkout order context', async () => {
    const { service, timelineService } = createService();

    const response = await service.createOrder(
      {
        ...dto,
        cartEvents: [
          {
            eventId: '4f5ed4d5-0fb9-4e0b-a338-24219637ec5f',
            timestamp: '2026-05-25T18:30:00.000Z',
            type: TimelineEventType.CART_ITEM_ADDED,
            payload: { productId: 'fries', quantity: 1 },
          },
          {
            eventId: '320b0197-9e9e-4356-bf77-639a7c728699',
            timestamp: '2026-05-25T18:31:00.000Z',
            type: TimelineEventType.CART_ITEM_UPDATED,
            payload: { productId: 'fries', quantity: 2 },
          },
          {
            eventId: 'c4c0ec4e-0789-44b1-9815-69e64a1eaf40',
            timestamp: '2026-05-25T18:32:00.000Z',
            type: TimelineEventType.CART_ITEM_REMOVED,
            payload: { productId: 'fries' },
          },
        ],
      },
      'cart-events-key',
      user,
    );

    expect(timelineService.appendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: '4f5ed4d5-0fb9-4e0b-a338-24219637ec5f',
        orderId: response.orderId,
        userId: user.userId,
        type: TimelineEventType.CART_ITEM_ADDED,
        source: TimelineEventSource.WEB,
        correlationId: response.correlationId,
        timestamp: new Date('2026-05-25T18:30:00.000Z'),
      }),
    );
    expect(timelineService.appendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TimelineEventType.CART_ITEM_UPDATED,
        source: TimelineEventSource.WEB,
        correlationId: response.correlationId,
      }),
    );
    expect(timelineService.appendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TimelineEventType.CART_ITEM_REMOVED,
        source: TimelineEventSource.WEB,
        correlationId: response.correlationId,
      }),
    );
  });

  it('rejects non-cart events in checkout payload before creating an order', async () => {
    const { service, ordersRepository, timelineService } = createService();

    await expect(
      service.createOrder(
        {
          ...dto,
          cartEvents: [
            {
              eventId: '5a497a5b-8505-45dd-bd88-b742aeb65db4',
              timestamp: '2026-05-25T18:30:00.000Z',
              type: TimelineEventType.ORDER_PLACED,
              payload: { productId: 'fries' },
            },
          ],
        },
        'invalid-cart-event-key',
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(ordersRepository.create).not.toHaveBeenCalled();
    expect(timelineService.appendEvent).not.toHaveBeenCalled();
  });

  it('does not replay cart timeline events for repeated idempotency keys', async () => {
    const { service, ordersRepository, timelineService } = createService();
    const orderPayload = {
      ...dto,
      cartEvents: [
        {
          eventId: '9c03e43c-f0e4-4a5d-8473-67974fd12ea5',
          timestamp: '2026-05-25T18:30:00.000Z',
          type: TimelineEventType.CART_ITEM_ADDED,
          payload: { productId: 'fries', quantity: 1 },
        },
      ],
    };

    const first = await service.createOrder(
      orderPayload,
      'same-cart-event-key',
      user,
    );
    const second = await service.createOrder(
      orderPayload,
      'same-cart-event-key',
      user,
    );

    expect(second.orderId).toBe(first.orderId);
    expect(ordersRepository.create).toHaveBeenCalledTimes(1);
    expect(timelineService.appendEvent).toHaveBeenCalledTimes(4);
  });

  it('missing Idempotency-Key returns 400', async () => {
    const { service } = createService();
    const controller = new OrdersController(service);

    expect(() => controller.createOrder(dto, undefined)).toThrow(
      BadRequestException,
    );
  });

  it('updates order status and writes a timeline event', async () => {
    const { service, ordersRepository, timelineService } = createService();
    ordersRepository.findById.mockResolvedValue({
      _id: 'order-1',
      userId: user.userId,
      status: OrderStatus.PLACED,
      items: [],
      pricing: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    ordersRepository.updateStatus.mockResolvedValue({
      _id: 'order-1',
      userId: user.userId,
      status: OrderStatus.PREPARING,
      items: [],
      pricing: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await service.updateOrderStatus(
      'order-1',
      OrderStatus.PREPARING,
      user,
    );

    expect(response.status).toBe(OrderStatus.PREPARING);
    expect(ordersRepository.updateStatus).toHaveBeenCalledWith(
      'order-1',
      OrderStatus.PREPARING,
    );
    expect(timelineService.appendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-1',
        payload: { from: OrderStatus.PLACED, to: OrderStatus.PREPARING },
      }),
    );
  });
});
