import { ObjectId } from '@mikro-orm/mongodb';
import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';

import { Platform } from '../entities/queue-item.entity';
import { ScheduleService } from '../services/schedule.service';

@Controller('socialsync/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Delete schedule
   */
  @Delete(':id')
  async deleteSchedule(@Param('id') id: string) {
    await this.scheduleService.deleteSchedule(new ObjectId(id));

    return {
      message: 'Schedule deleted',
      success: true,
    };
  }

  /**
   * Get schedules
   */
  @Get()
  async getSchedules(
    @Query('userId') userId: string,
    @Query('platform') platform?: Platform,
  ) {
    const schedules = await this.scheduleService.getSchedules(
      new ObjectId(userId),
      platform,
    );

    return {
      count: schedules.length,
      schedules,
      success: true,
    };
  }

  /**
   * Create or update schedule
   */
  @Post()
  async upsertSchedule(
    @Body('userId') userId: string,
    @Body('platform') platform: Platform,
    @Body('days') days: number[],
    @Body('times') times: string[],
    @Body('enabled') enabled = true,
    @Body('channelId') channelId?: string,
  ) {
    const schedule = await this.scheduleService.upsertSchedule(
      new ObjectId(userId),
      platform,
      days,
      times,
      enabled,
      channelId ? new ObjectId(channelId) : undefined,
    );

    return {
      schedule,
      success: true,
    };
  }
}
