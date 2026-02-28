import { ObjectId } from '@mikro-orm/mongodb';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';

import { Platform, QueueStatus } from '../entities/queue-item.entity';
import { QueueService } from '../services/queue.service';

@Controller('socialsync/queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Add item to queue
   */
  @Post()
  async addToQueue(
    @Body('userId') userId: string,
    @Body('contentId') contentId: string,
    @Body('platform') platform: Platform,
    @Body('scheduledFor') scheduledFor: string,
    @Body('channelId') channelId?: string,
  ) {
    const item = await this.queueService.addToQueue(
      new ObjectId(userId),
      new ObjectId(contentId),
      platform,
      new Date(scheduledFor),
      channelId ? new ObjectId(channelId) : undefined,
    );

    return {
      item,
      success: true,
    };
  }

  /**
   * Delete queue item
   */
  @Delete(':id')
  async deleteQueueItem(@Param('id') id: string) {
    await this.queueService.deleteQueueItem(new ObjectId(id));

    return {
      message: 'Queue item deleted',
      success: true,
    };
  }

  /**
   * Get queue items
   */
  @Get()
  async getQueue(
    @Query('userId') userId: string,
    @Query('platform') platform?: Platform,
    @Query('status') status?: QueueStatus,
    @Query('limit') limit?: string,
  ) {
    const items = await this.queueService.getQueueItems(
      new ObjectId(userId),
      platform,
      status,
      limit ? parseInt(limit) : undefined,
    );

    return {
      count: items.length,
      items,
      success: true,
    };
  }

  /**
   * Get queue statistics
   */
  @Get('stats')
  async getStats(@Query('userId') userId: string) {
    const stats = await this.queueService.getStats(new ObjectId(userId));

    return {
      stats,
      success: true,
    };
  }

  /**
   * Update queue item status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: QueueStatus,
    @Body('error') error?: string,
  ) {
    const item = await this.queueService.updateStatus(
      new ObjectId(id),
      status,
      error,
    );

    return {
      item,
      success: true,
    };
  }
}
