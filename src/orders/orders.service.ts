import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { PricingBreakdown } from '../cart/dto/pricing-response.dto';
import { PricingService } from '../cart/pricing.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrderStatus } from '../common/enums/order-status.enum';
import {
  TimelineEventSource,
  TimelineEventType,
} from '../common/enums/timeline.enum';
import { TimelineService } from '../timeline/timeline.service';
import { CartTimelineEventDto, CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';
import { OrdersRepository } from './orders.repository';
import { IdempotencyService } from './idempotency.service';

const CART_TIMELINE_EVENT_TYPES = new Set<TimelineEventType>([
  TimelineEventType.CART_ITEM_ADDED,
  TimelineEventType.CART_ITEM_UPDATED,
  TimelineEventType.CART_ITEM_REMOVED,
]);

@Injectable()
export class OrdersService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly ordersRepository: OrdersRepository,
    private readonly idempotencyService: IdempotencyService,
    private readonly timelineService: TimelineService,
  ) {}

  async createOrder(
    dto: CreateOrderDto,
    idempotencyKey: string,
    user: AuthenticatedUser,
  ) {
    const userId = user.userId;
    const existing = await this.idempotencyService.find(idempotencyKey, userId);
    if (existing?.orderId) {
      return {
        orderId: existing.orderId,
        status: OrderStatus.PLACED,
        correlationId: existing.correlationId,
      };
    }

    const reserved =
      existing ??
      (await this.idempotencyService.reserve(idempotencyKey, userId));
    if (reserved?.orderId) {
      return {
        orderId: reserved.orderId,
        status: OrderStatus.PLACED,
        correlationId: reserved.correlationId,
      };
    }

    const orderId = uuidv4();
    const correlationId = uuidv4();

    this.validateCartEventTypes(dto.cartEvents ?? []);

    let pricing: PricingBreakdown;
    try {
      pricing = await this.pricingService.priceCart({
        items: dto.items,
      });
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

    await this.appendCartEvents(
      dto.cartEvents ?? [],
      orderId,
      userId,
      correlationId,
    );
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

    await this.idempotencyService.complete(
      idempotencyKey,
      userId,
      orderId,
      correlationId,
    );
    return { orderId, status: OrderStatus.PLACED, correlationId };
  }

  async listOrders(user: AuthenticatedUser) {
    const orders = await this.ordersRepository.findByUser(user.userId);
    return orders.map((order) => this.toOrderResponse(order));
  }

  async getOrder(orderId: string, user: AuthenticatedUser) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order || order.userId !== user.userId) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    return this.toOrderResponse(order);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    user: AuthenticatedUser,
  ) {
    const currentOrder = await this.ordersRepository.findById(orderId);
    if (!currentOrder || currentOrder.userId !== user.userId) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    const updatedOrder = await this.ordersRepository.updateStatus(
      orderId,
      status,
    );
    if (!updatedOrder) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    await this.timelineService.appendEvent({
      orderId,
      userId: user.userId,
      type: TimelineEventType.ORDER_STATUS_CHANGED,
      source: TimelineEventSource.API,
      correlationId: uuidv4(),
      payload: { from: currentOrder.status, to: status },
    });

    return this.toOrderResponse(updatedOrder);
  }

  private async appendCartEvents(
    events: CartTimelineEventDto[],
    orderId: string,
    userId: string,
    correlationId: string,
  ) {
    for (const event of events) {
      await this.timelineService.appendEvent({
        eventId: event.eventId,
        orderId,
        userId,
        type: event.type,
        source: TimelineEventSource.WEB,
        correlationId,
        payload: event.payload,
        timestamp: new Date(event.timestamp),
      });
    }
  }

  private validateCartEventTypes(events: CartTimelineEventDto[]) {
    const invalid = events.find(
      (event) => !CART_TIMELINE_EVENT_TYPES.has(event.type),
    );
    if (invalid) {
      throw new BadRequestException(
        `Unsupported cart timeline event type: ${invalid.type}`,
      );
    }
  }

  private toOrderResponse(order: Order) {
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
