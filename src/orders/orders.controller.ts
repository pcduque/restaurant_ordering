import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, BadRequestException } from '@nestjs/common';
import { ApiAcceptedResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiAcceptedResponse({ description: 'Order accepted for asynchronous-style creation.' })
  createOrder(@Body() dto: CreateOrderDto, @Headers('idempotency-key') idempotencyKey?: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return this.ordersService.createOrder(dto, idempotencyKey);
  }

  @Get(':orderId')
  @ApiOkResponse({ description: 'Returns an order by id.' })
  getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.getOrder(orderId);
  }
}
