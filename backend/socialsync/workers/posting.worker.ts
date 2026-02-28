import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PostingService } from '../services/posting.service';

@Injectable()
export class PostingWorker {
  private readonly logger = new Logger(PostingWorker.name);

  constructor(private readonly postingService: PostingService) {}

  /**
   * Check for due posts every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkDuePosts() {
    this.logger.log('Checking for due posts...');

    try {
      await this.postingService.processDueItems();
    } catch (error) {
      this.logger.error('Error processing due items:', error);
    }
  }
}
