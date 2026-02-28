import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
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

import { YouTubeChannel } from '../entities/youtube-channel.entity';
import { YouTubeService } from '../services/youtube.service';

@Controller('socialsync/channels')
export class ChannelsController {
  constructor(
    @InjectRepository(YouTubeChannel)
    private readonly channelRepository: EntityRepository<YouTubeChannel>,
    private readonly youtubeService: YouTubeService,
  ) {}

  /**
   * Delete channel
   */
  @Delete(':id')
  async deleteChannel(@Param('id') id: string) {
    await this.channelRepository.nativeDelete({ _id: new ObjectId(id) });

    return {
      message: 'Channel deleted',
      success: true,
    };
  }

  /**
   * Fetch channels from YouTube
   */
  @Post('fetch')
  async fetchFromYouTube(@Body('userId') userId: string) {
    const userObjectId = new ObjectId(userId);

    // Get channels from YouTube API
    const ytChannels = await this.youtubeService.getChannels(userObjectId);

    let added = 0;

    for (const ytChannel of ytChannels) {
      // Check if exists
      const existing = await this.channelRepository.findOne({
        channelId: ytChannel.id,
      });

      if (!existing) {
        const channel = this.channelRepository.create({
          channelHandle: ytChannel.snippet.customUrl,
          channelId: ytChannel.id,
          channelName: ytChannel.snippet.title,
          dailyQuota: 6,
          enabled: true,
          postingIntervalMinutes: 30,
          thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url,
          userId: userObjectId,
        });

        await this.channelRepository.persistAndFlush(channel);
        added++;
      }
    }

    return {
      added,
      success: true,
      total: ytChannels.length,
    };
  }

  /**
   * Get user's YouTube channels
   */
  @Get()
  async getChannels(@Query('userId') userId: string) {
    const channels = await this.channelRepository.find({
      userId: new ObjectId(userId),
    });

    return {
      channels,
      count: channels.length,
      success: true,
    };
  }

  /**
   * Update channel
   */
  @Patch(':id')
  async updateChannel(
    @Param('id') id: string,
    @Body() updateData: Partial<YouTubeChannel>,
  ) {
    const channel = await this.channelRepository.findOne(new ObjectId(id));

    if (!channel) {
      return { error: 'Channel not found', success: false };
    }

    Object.assign(channel, updateData);
    channel.updatedAt = new Date();

    await this.channelRepository.flush();

    return {
      channel,
      success: true,
    };
  }
}
