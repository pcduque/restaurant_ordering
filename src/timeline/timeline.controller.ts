import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';

@ApiTags('timeline')
@Controller('orders/:orderId/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiOkResponse({ description: 'Returns timeline events sorted by timestamp ascending.' })
  getTimeline(
    @Param('orderId') orderId: string,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.timelineService.getOrderTimeline(orderId, pageSize, cursor);
  }
}
