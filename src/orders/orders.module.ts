import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { TimelineModule } from '../timeline/timeline.module';
import { IdempotencyService } from './idempotency.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import {
  IdempotencyKey,
  IdempotencyKeySchema,
} from './schemas/idempotency-key.schema';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    AuthModule,
    CartModule,
    TimelineModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: IdempotencyKey.name, schema: IdempotencyKeySchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, IdempotencyService],
})
export class OrdersModule {}
