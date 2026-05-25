import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../common/enums/order-status.enum';
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
