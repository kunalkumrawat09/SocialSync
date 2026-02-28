import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Controller, Get, Query } from '@nestjs/common';

import { ContentItem } from '../entities/content-item.entity';
import { ActivityService } from '../services/activity.service';
import { QueueService } from '../services/queue.service';

@Controller('socialsync/stats')
export class StatsController {
  constructor(
    private readonly queueService: QueueService,
    private readonly activityService: ActivityService,
    @InjectRepository(ContentItem)
    private readonly contentRepository: EntityRepository<ContentItem>,
  ) {}

  /**
   * Get activity feed
   */
  @Get('activity')
  async getActivity(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const activities = await this.activityService.getRecentActivities(
      new ObjectId(userId),
      limit ? parseInt(limit) : 50,
    );

    return {
      activities,
      count: activities.length,
      success: true,
    };
  }

  /**
   * Get dashboard statistics
   */
  @Get('dashboard')
  async getDashboardStats(@Query('userId') userId: string) {
    const userObjectId = new ObjectId(userId);

    // Get queue stats
    const queueStats = await this.queueService.getStats(userObjectId);

    // Get content count
    const contentCount = await this.contentRepository.count({
      userId: userObjectId,
    });

    // Get recent activity
    const recentActivity = await this.activityService.getRecentActivities(
      userObjectId,
      10,
    );

    // Get activity stats
    const activityStats = await this.activityService.getStats(userObjectId);

    return {
      recentActivity,
      stats: {
        activityStats,
        contentCount,
        queue: queueStats,
      },
      success: true,
    };
  }
}
