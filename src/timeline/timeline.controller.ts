import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { TimelineService } from './timeline.service';

@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('orders/:orderId/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiOkResponse({
    description: 'Returns timeline events sorted by timestamp ascending.',
  })
  getTimeline(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.timelineService.getOrderTimeline(
      orderId,
      user,
      pageSize,
      cursor,
    );
  }
}
