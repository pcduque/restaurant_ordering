import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  TimelineEvent,
  TimelineEventSchema,
} from './schemas/timeline-event.schema';
import { TimelineController } from './timeline.controller';
import { TimelineRepository } from './timeline.repository';
import { TimelineService } from './timeline.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: TimelineEvent.name, schema: TimelineEventSchema },
    ]),
  ],
  controllers: [TimelineController],
  providers: [TimelineService, TimelineRepository],
  exports: [TimelineService, TimelineRepository],
})
export class TimelineModule {}
