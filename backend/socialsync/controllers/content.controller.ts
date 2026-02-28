import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
} from '@nestjs/common';

import { ActivityType } from '../entities/activity.entity';
import { ContentItem, ContentStatus } from '../entities/content-item.entity';
import { ActivityService } from '../services/activity.service';
import { DriveService } from '../services/drive.service';

@Controller('socialsync/content')
export class ContentController {
  constructor(
    @InjectRepository(ContentItem)
    private readonly contentRepository: EntityRepository<ContentItem>,
    private readonly driveService: DriveService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Get content library
   */
  @Get()
  async getContent(
    @Query('userId') userId: string,
    @Query('status') status?: ContentStatus,
    @Query('limit') limit?: string,
  ) {
    const filter: Partial<ContentItem> = { userId: new ObjectId(userId) };

    if (status) {
      filter.status = status;
    }

    const items = await this.contentRepository.find(filter, {
      limit: limit ? parseInt(limit) : 1000,
      orderBy: { discoveredAt: 'DESC' },
    });

    return {
      count: items.length,
      items,
      success: true,
    };
  }

  /**
   * Get single content item
   */
  @Get(':id')
  async getContentItem(@Param('id') id: string) {
    const item = await this.contentRepository.findOne(new ObjectId(id));

    if (!item) {
      return { error: 'Content not found', success: false };
    }

    return {
      item,
      success: true,
    };
  }

  /**
   * Scan Google Drive folder for new content
   */
  @Post('scan')
  async scanFolder(
    @Body('userId') userId: string,
    @Body('folderId') folderId: string,
  ) {
    const userObjectId = new ObjectId(userId);

    // Get files from Drive
    const files = await this.driveService.listFilesInFolder(
      userObjectId,
      folderId,
    );

    let discovered = 0;
    let skipped = 0;

    for (const file of files) {
      // Check if already exists
      const existing = await this.contentRepository.findOne({
        driveFileId: file.id,
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create new content item
      const contentItem = this.contentRepository.create({
        driveFileId: file.id,
        filename: file.name,
        folderId,
        mimeType: file.mimeType,
        sizeBytes: parseInt(file.size) || 0,
        status: ContentStatus.PENDING,
        thumbnailUrl: file.thumbnailLink,
        userId: userObjectId,
      });

      await this.contentRepository.persistAndFlush(contentItem);
      discovered++;
    }

    // Log activity
    await this.activityService.log(
      userObjectId,
      ActivityType.CONTENT_DISCOVERED,
      `Discovered ${discovered} new videos, skipped ${skipped}`,
      { discovered, folderId, skipped },
    );

    return {
      discovered,
      skipped,
      success: true,
      total: files.length,
    };
  }
}
