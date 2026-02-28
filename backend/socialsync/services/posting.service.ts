import { EntityRepository } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';

import { ActivityType } from '../entities/activity.entity';
import { ContentItem } from '../entities/content-item.entity';
import { Platform, QueueStatus } from '../entities/queue-item.entity';
import { ActivityService } from './activity.service';
import { DriveService } from './drive.service';
import { InstagramService } from './instagram.service';
import { QueueService } from './queue.service';
import { YouTubeService } from './youtube.service';

@Injectable()
export class PostingService {
  private readonly logger = new Logger(PostingService.name);
  private readonly publishers: Map<Platform, any>;

  constructor(
    private readonly queueService: QueueService,
    private readonly driveService: DriveService,
    private readonly youtubeService: YouTubeService,
    private readonly instagramService: InstagramService,
    private readonly activityService: ActivityService,
    @InjectRepository(ContentItem)
    private readonly contentRepository: EntityRepository<ContentItem>,
  ) {
    // Register publishers
    this.publishers = new Map();
    this.publishers.set(Platform.YOUTUBE, this.youtubeService);
    this.publishers.set(Platform.INSTAGRAM, this.instagramService);
  }

  /**
   * Process all due queue items
   */
  async processDueItems(): Promise<void> {
    this.logger.log('Checking for due queue items...');

    const dueItems = await this.queueService.getDueItems();

    this.logger.log(`Found ${dueItems.length} due items`);

    for (const item of dueItems) {
      await this.processQueueItem(item._id);
    }
  }

  /**
   * Process a single queue item
   */
  async processQueueItem(queueItemId: any): Promise<void> {
    const queueItem = await this.queueService
      .getQueueItems(undefined, undefined, undefined, 1)
      .then((items) => items.find((i) => i._id.equals(queueItemId)));

    if (!queueItem) {
      this.logger.warn(`Queue item ${queueItemId} not found`);
      return;
    }

    // Skip if not pending
    if (queueItem.status !== QueueStatus.PENDING) {
      return;
    }

    // Mark as processing
    await this.queueService.updateStatus(queueItem._id, QueueStatus.PROCESSING);

    this.logger.log(
      `Processing queue item ${queueItem._id} for platform ${queueItem.platform}`,
    );

    try {
      // Get content item
      const content = await this.contentRepository.findOne(queueItem.contentId);

      if (!content) {
        throw new Error('Content not found');
      }

      // Download file from Google Drive
      this.logger.log(`Downloading ${content.filename} from Google Drive...`);
      const filePath = await this.driveService.downloadFile(
        queueItem.userId,
        content.driveFileId,
        content.filename,
      );

      // Get publisher for platform
      const publisher = this.publishers.get(queueItem.platform);

      if (!publisher) {
        throw new Error(
          `No publisher found for platform ${queueItem.platform}`,
        );
      }

      // Publish
      this.logger.log(
        `Publishing ${content.filename} to ${queueItem.platform}...`,
      );
      const result = await publisher.publish(
        content._id.toString(),
        filePath,
        {
          description: content.description,
          tags: content.tags,
          title: content.title,
        },
        queueItem.youtubeScheduledPublishAt?.toISOString(),
      );

      // Cleanup file
      this.driveService.cleanupFile(filePath);

      if (result.success) {
        // Mark as posted
        await this.queueService.updateStatus(
          queueItem._id,
          QueueStatus.POSTED,
          undefined,
          result.postId,
        );

        // Log activity
        await this.activityService.log(
          queueItem.userId,
          ActivityType.POST_SUCCESS,
          `Posted ${content.filename} to ${queueItem.platform}`,
          {
            contentId: content._id.toString(),
            platform: queueItem.platform,
            postId: result.postId,
          },
        );

        this.logger.log(`✅ Successfully posted ${content.filename}`);
      } else {
        // Mark as failed
        await this.queueService.updateStatus(
          queueItem._id,
          QueueStatus.FAILED,
          result.error,
        );

        // Log activity
        await this.activityService.log(
          queueItem.userId,
          ActivityType.POST_FAILED,
          `Failed to post ${content.filename} to ${queueItem.platform}: ${result.error}`,
          {
            contentId: content._id.toString(),
            error: result.error,
            platform: queueItem.platform,
          },
        );

        this.logger.error(
          `❌ Failed to post ${content.filename}: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error processing queue item ${queueItem._id}:`, error);

      await this.queueService.updateStatus(
        queueItem._id,
        QueueStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error',
      );

      // Log activity
      await this.activityService.log(
        queueItem.userId,
        ActivityType.POST_FAILED,
        `Error processing queue item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          queueItemId: queueItem._id.toString(),
        },
      );
    }
  }
}
