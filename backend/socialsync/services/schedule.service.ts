import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { Platform } from '../entities/queue-item.entity';
import { Schedule } from '../entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: EntityRepository<Schedule>,
  ) {}

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId: ObjectId): Promise<void> {
    await this.scheduleRepository.nativeDelete({ _id: scheduleId });
  }

  /**
   * Get enabled schedules
   */
  async getEnabledSchedules(
    userId: ObjectId,
    platform?: Platform,
  ): Promise<Schedule[]> {
    const filter: any = { enabled: true, userId };

    if (platform) {
      filter.platform = platform;
    }

    return this.scheduleRepository.find(filter);
  }

  /**
   * Get next scheduled time slot
   */
  getNextScheduledTime(schedule: Schedule): Date | null {
    if (
      !schedule.enabled ||
      schedule.days.length === 0 ||
      schedule.times.length === 0
    ) {
      return null;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Try to find a slot today
    if (schedule.days.includes(currentDay)) {
      for (const time of schedule.times.sort()) {
        if (time > currentTime) {
          const [hours, minutes] = time.split(':').map(Number);
          const nextTime = new Date();
          nextTime.setHours(hours, minutes, 0, 0);
          return nextTime;
        }
      }
    }

    // Find next day with schedule
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      if (schedule.days.includes(nextDay)) {
        const [hours, minutes] = schedule.times[0].split(':').map(Number);
        const nextTime = new Date();
        nextTime.setDate(nextTime.getDate() + i);
        nextTime.setHours(hours, minutes, 0, 0);
        return nextTime;
      }
    }

    return null;
  }

  /**
   * Get schedules for a user
   */
  async getSchedules(
    userId: ObjectId,
    platform?: Platform,
  ): Promise<Schedule[]> {
    const filter: any = { userId };

    if (platform) {
      filter.platform = platform;
    }

    return this.scheduleRepository.find(filter);
  }

  /**
   * Create or update schedule
   */
  async upsertSchedule(
    userId: ObjectId,
    platform: Platform,
    days: number[],
    times: string[],
    enabled = true,
    channelId?: ObjectId,
  ): Promise<Schedule> {
    let schedule = await this.scheduleRepository.findOne({
      channelId,
      platform,
      userId,
    });

    if (!schedule) {
      schedule = this.scheduleRepository.create({
        channelId,
        days,
        enabled,
        platform,
        times,
        userId,
      });
    } else {
      schedule.days = days;
      schedule.times = times;
      schedule.enabled = enabled;
      schedule.updatedAt = new Date();
    }

    await this.scheduleRepository.persistAndFlush(schedule);
    return schedule;
  }
}
