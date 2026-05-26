import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CartItemDto } from '../../cart/dto/cart-item.dto';
import { TimelineEventType } from '../../common/enums/timeline.enum';

export class CartTimelineEventDto {
  @ApiProperty({ example: '7d9a80ea-5f9a-4583-8f56-8d881f463f4a' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: '2026-05-25T18:30:00.000Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    enum: TimelineEventType,
    example: TimelineEventType.CART_ITEM_ADDED,
  })
  @IsEnum(TimelineEventType)
  type: TimelineEventType;

  @ApiProperty({ type: Object })
  @IsObject()
  payload: Record<string, unknown>;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty({ type: [CartTimelineEventDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartTimelineEventDto)
  cartEvents?: CartTimelineEventDto[];
}
