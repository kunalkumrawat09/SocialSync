import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';

// Entities
import { Activity } from './entities/activity.entity';
import { ContentItem } from './entities/content-item.entity';
import { OAuthToken } from './entities/oauth-token.entity';
import { QueueItem } from './entities/queue-item.entity';
import { Schedule } from './entities/schedule.entity';
import { YouTubeChannel } from './entities/youtube-channel.entity';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { ChannelsController } from './controllers/channels.controller';
import { ContentController } from './controllers/content.controller';
import { QueueController } from './controllers/queue.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { StatsController } from './controllers/stats.controller';

// Services
import { ActivityService } from './services/activity.service';
import { DriveService } from './services/drive.service';
import { InstagramService } from './services/instagram.service';
import { OAuthService } from './services/oauth.service';
import { PostingService } from './services/posting.service';
import { QueueService } from './services/queue.service';
import { ScheduleService } from './services/schedule.service';
import { YouTubeService } from './services/youtube.service';

// Workers
import { ContentScannerWorker } from './workers/content-scanner.worker';
import { PostingWorker } from './workers/posting.worker';

@Module({
  controllers: [
    ContentController,
    QueueController,
    ScheduleController,
    ChannelsController,
    AuthController,
    StatsController,
  ],
  exports: [
    DriveService,
    InstagramService,
    YouTubeService,
    QueueService,
    ScheduleService,
    PostingService,
    OAuthService,
    ActivityService,
  ],
  imports: [
    MikroOrmModule.forFeature([
      ContentItem,
      QueueItem,
      Schedule,
      YouTubeChannel,
      OAuthToken,
      Activity,
    ]),
    BullModule.registerQueue(
      {
        name: 'socialsync-content-scan',
      },
      {
        name: 'socialsync-posting',
      },
    ),
  ],
  providers: [
    // Services
    DriveService,
    InstagramService,
    YouTubeService,
    QueueService,
    ScheduleService,
    PostingService,
    OAuthService,
    ActivityService,
    // Workers
    ContentScannerWorker,
    PostingWorker,
  ],
})
export class SocialsyncModule {}
