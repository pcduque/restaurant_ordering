import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PriceCartDto } from './dto/cart-item.dto';
import { PricingService } from './pricing.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('pricing')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Returns server-side cart pricing in integer cents.' })
  priceCart(@Body() dto: PriceCartDto) {
    return this.pricingService.priceCart(dto);
  }
}
