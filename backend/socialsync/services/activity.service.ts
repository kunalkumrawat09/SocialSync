import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { Activity, ActivityType } from '../entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: EntityRepository<Activity>,
  ) {}

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    userId: ObjectId,
    type: ActivityType,
    limit = 50,
  ): Promise<Activity[]> {
    return this.activityRepository.find(
      { type, userId },
      { limit, orderBy: { createdAt: 'DESC' } },
    );
  }

  /**
   * Get recent activities for a user
   */
  async getRecentActivities(userId: ObjectId, limit = 50): Promise<Activity[]> {
    return this.activityRepository.find(
      { userId },
      { limit, orderBy: { createdAt: 'DESC' } },
    );
  }

  /**
   * Get activity stats
   */
  async getStats(userId: ObjectId): Promise<Record<ActivityType, number>> {
    const activities = await this.activityRepository.find({ userId });

    const stats: Record<ActivityType, number> = {} as any;

    for (const type of Object.values(ActivityType)) {
      stats[type] = activities.filter((a) => a.type === type).length;
    }

    return stats;
  }

  /**
   * Log an activity
   */
  async log(
    userId: ObjectId,
    type: ActivityType,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      message,
      metadata,
      type,
      userId,
    });

    await this.activityRepository.persistAndFlush(activity);
    return activity;
  }
}
