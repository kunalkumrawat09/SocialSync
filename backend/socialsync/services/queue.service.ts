import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import {
  QueueItem,
  Platform,
  QueueStatus,
} from '../entities/queue-item.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueItem)
    private readonly queueRepository: EntityRepository<QueueItem>,
  ) {}

  /**
   * Add item to queue
   */
  async addToQueue(
    userId: ObjectId,
    contentId: ObjectId,
    platform: Platform,
    scheduledFor: Date,
    channelId?: ObjectId,
  ): Promise<QueueItem> {
    const queueItem = this.queueRepository.create({
      channelId,
      contentId,
      platform,
      scheduledFor,
      status: QueueStatus.PENDING,
      userId,
    });

    await this.queueRepository.persistAndFlush(queueItem);
    return queueItem;
  }

  /**
   * Delete queue item
   */
  async deleteQueueItem(queueItemId: ObjectId): Promise<void> {
    await this.queueRepository.nativeDelete({ _id: queueItemId });
  }

  /**
   * Get due queue items (ready to post)
   */
  async getDueItems(userId?: ObjectId): Promise<QueueItem[]> {
    const filter: any = {
      scheduledFor: { $lte: new Date() },
      status: QueueStatus.PENDING,
    };

    if (userId) {
      filter.userId = userId;
    }

    return this.queueRepository.find(filter, {
      limit: 100,
      orderBy: { scheduledFor: 'ASC' },
    });
  }

  /**
   * Get queue items for a user
   */
  async getQueueItems(
    userId: ObjectId,
    platform?: Platform,
    status?: QueueStatus,
    limit?: number,
  ): Promise<QueueItem[]> {
    const filter: any = { userId };

    if (platform) {
      filter.platform = platform;
    }

    if (status) {
      filter.status = status;
    }

    return this.queueRepository.find(filter, {
      limit,
      orderBy: { scheduledFor: 'ASC' },
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(userId: ObjectId): Promise<{
    pending: number;
    processing: number;
    posted: number;
    failed: number;
    scheduled: number;
  }> {
    const items = await this.queueRepository.find({ userId });

    return {
      failed: items.filter((i) => i.status === QueueStatus.FAILED).length,
      pending: items.filter((i) => i.status === QueueStatus.PENDING).length,
      posted: items.filter((i) => i.status === QueueStatus.POSTED).length,
      processing: items.filter((i) => i.status === QueueStatus.PROCESSING)
        .length,
      scheduled: items.filter((i) => i.status === QueueStatus.SCHEDULED).length,
    };
  }

  /**
   * Update queue item status
   */
  async updateStatus(
    queueItemId: ObjectId,
    status: QueueStatus,
    error?: string,
    platformPostId?: string,
  ): Promise<QueueItem> {
    const queueItem = await this.queueRepository.findOneOrFail(queueItemId);

    queueItem.status = status;
    queueItem.updatedAt = new Date();

    if (error) {
      queueItem.lastError = error;
    }

    if (platformPostId) {
      queueItem.platformPostId = platformPostId;
    }

    if (status === QueueStatus.POSTED) {
      queueItem.postedAt = new Date();
    }

    if (status === QueueStatus.PROCESSING) {
      queueItem.attempts += 1;
    }

    await this.queueRepository.flush();
    return queueItem;
  }
}
