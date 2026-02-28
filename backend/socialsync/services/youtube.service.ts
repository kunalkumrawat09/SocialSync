import { ObjectId } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { google } from 'googleapis';

import { OAuthPlatform } from '../entities/oauth-token.entity';
import {
  Publisher,
  PublishResult,
  PublishMetadata,
} from '../interfaces/publisher.interface';
import { OAuthService } from './oauth.service';

@Injectable()
export class YouTubeService implements Publisher {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Get authenticated YouTube client
   */
  private async getYouTubeClient(userId: ObjectId) {
    const token = await this.oauthService.getToken(
      userId,
      OAuthPlatform.YOUTUBE,
    );

    if (!token) {
      throw new Error('YouTube not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    return google.youtube({ auth: oauth2Client, version: 'v3' });
  }

  /**
   * Get user's YouTube channels
   */
  async getChannels(userId: ObjectId): Promise<any[]> {
    const youtube = await this.getYouTubeClient(userId);

    const response = await youtube.channels.list({
      mine: true,
      part: ['snippet', 'contentDetails'],
    });

    return response.data.items || [];
  }

  /**
   * Publish video to YouTube
   */
  async publish(
    contentId: string,
    filePath: string,
    metadata?: PublishMetadata,
    scheduledPublishAt?: string,
  ): Promise<PublishResult> {
    try {
      const userId = new ObjectId(contentId); // TODO: Get userId properly
      const youtube = await this.getYouTubeClient(userId);

      const videoMetadata: any = {
        snippet: {
          categoryId: '22', // People & Blogs
          description: metadata?.description || '',
          tags: metadata?.tags || [],
          title: metadata?.title || 'Untitled Video',
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      };

      // If scheduled, set publish time
      if (scheduledPublishAt) {
        videoMetadata.status.privacyStatus = 'private';
        videoMetadata.status.publishAt = scheduledPublishAt;
      }

      const response = await youtube.videos.insert({
        media: {
          body: fs.createReadStream(filePath),
        },
        part: ['snippet', 'status'],
        requestBody: videoMetadata,
      });

      return {
        postId: response.data.id,
        scheduledFor: scheduledPublishAt,
        success: true,
      };
    } catch (error) {
      console.error('[YouTubeService] Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }
}
