import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiAcceptedResponse({
    description: 'Order accepted for asynchronous-style creation.',
  })
  createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return this.ordersService.createOrder(dto, idempotencyKey, user);
  }

  @Get()
  @ApiOkResponse({
    description: 'Returns orders created by the authenticated user.',
  })
  listOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.listOrders(user);
  }

  @Get(':orderId')
  @ApiOkResponse({ description: 'Returns an order by id.' })
  getOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.getOrder(orderId, user);
  }

  @Patch(':orderId/status')
  @ApiOkResponse({ description: 'Updates an order status manually.' })
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto.status, user);
  }
}
