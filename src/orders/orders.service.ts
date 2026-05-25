import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PriceCartDto } from '../cart/dto/cart-item.dto';
import { PricingService } from '../cart/pricing.service';
import { MOCK_USER_ID } from '../common/constants/user.constants';
import { OrderStatus } from '../common/enums/order-status.enum';
import { TimelineEventSource, TimelineEventType } from '../common/enums/timeline.enum';
import { TimelineService } from '../timeline/timeline.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersRepository } from './orders.repository';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly ordersRepository: OrdersRepository,
    private readonly idempotencyService: IdempotencyService,
    private readonly timelineService: TimelineService,
  ) {}

  async createOrder(dto: CreateOrderDto, idempotencyKey: string) {
    const userId = MOCK_USER_ID;
    const existing = await this.idempotencyService.find(idempotencyKey, userId);
    if (existing?.orderId) {
      return { orderId: existing.orderId, status: OrderStatus.PLACED, correlationId: existing.correlationId };
    }

    const reserved = existing ?? (await this.idempotencyService.reserve(idempotencyKey, userId));
    if (reserved?.orderId) {
      return { orderId: reserved.orderId, status: OrderStatus.PLACED, correlationId: reserved.correlationId };
    }

    const orderId = uuidv4();
    const correlationId = uuidv4();

    let pricing;
    try {
      pricing = await this.pricingService.priceCart({ items: dto.items } as PriceCartDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        await this.timelineService.appendEvent({
          orderId,
          userId,
          type: TimelineEventType.VALIDATION_FAILED,
          source: TimelineEventSource.API,
          correlationId,
          payload: { reason: error.message },
        });
      }
      throw error;
    }

    await this.ordersRepository.create({
      _id: orderId,
      userId,
      status: OrderStatus.PLACED,
      items: dto.items as unknown as Record<string, unknown>[],
      pricing,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.timelineService.appendEvent({
      orderId,
      userId,
      type: TimelineEventType.PRICING_CALCULATED,
      source: TimelineEventSource.API,
      correlationId,
      payload: { pricing },
    });
    await this.timelineService.appendEvent({
      orderId,
      userId,
      type: TimelineEventType.ORDER_PLACED,
      source: TimelineEventSource.API,
      correlationId,
      payload: { itemCount: dto.items.length },
    });
    await this.timelineService.appendEvent({
      orderId,
      userId,
      type: TimelineEventType.ORDER_STATUS_CHANGED,
      source: TimelineEventSource.API,
      correlationId,
      payload: { from: null, to: OrderStatus.PLACED },
    });

    await this.idempotencyService.complete(idempotencyKey, userId, orderId, correlationId);
    return { orderId, status: OrderStatus.PLACED, correlationId };
  }

  async getOrder(orderId: string) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    return {
      orderId: order._id,
      userId: order.userId,
      status: order.status,
      items: order.items,
      pricing: order.pricing,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
