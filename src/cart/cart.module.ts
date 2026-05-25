import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { CartController } from './cart.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [MenuModule],
  controllers: [CartController],
  providers: [PricingService],
  exports: [PricingService],
})
export class CartModule {}
