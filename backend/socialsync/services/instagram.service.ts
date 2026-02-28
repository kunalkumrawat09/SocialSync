import { ObjectId } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

import { OAuthPlatform } from '../entities/oauth-token.entity';
import {
  Publisher,
  PublishResult,
  PublishMetadata,
} from '../interfaces/publisher.interface';
import { OAuthService } from './oauth.service';

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

@Injectable()
export class InstagramService implements Publisher {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Create media container
   */
  private async createMediaContainer(
    userId: string,
    videoUrl: string,
    accessToken: string,
    metadata?: PublishMetadata,
  ): Promise<string | null> {
    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${userId}/media`,
        {
          caption: metadata?.caption || metadata?.description || '',
          media_type: 'REELS',
          share_to_feed: true,
          video_url: videoUrl,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.id;
    } catch (error) {
      console.error('[InstagramService] Create container error:', error);
      return null;
    }
  }

  /**
   * Publish the media container
   */
  private async publishContainer(
    containerId: string,
    userId: string,
    accessToken: string,
  ): Promise<string | null> {
    try {
      const response = await axios.post(
        `${GRAPH_API_BASE}/${userId}/media_publish`,
        { creation_id: containerId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.id;
    } catch (error) {
      console.error('[InstagramService] Publish error:', error);
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Upload video file using resumable upload
   */
  private async uploadVideo(
    userId: string,
    filePath: string,
    accessToken: string,
  ): Promise<string | null> {
    try {
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Initialize upload session
      const initResponse = await axios.post(
        `${GRAPH_API_BASE}/${userId}/media`,
        {
          file_size: fileSize,
          media_type: 'VIDEO',
          upload_type: 'resumable_upload',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const uploadSessionId = initResponse.data.id;

      // Upload file in chunks
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const fileBuffer = fs.readFileSync(filePath);
      let offset = 0;

      while (offset < fileSize) {
        const chunk = fileBuffer.slice(
          offset,
          Math.min(offset + chunkSize, fileSize),
        );

        const formData = new FormData();
        formData.append('file', chunk, { filename: 'video.mp4' });
        formData.append('offset', offset.toString());
        formData.append('file_size', fileSize.toString());

        await axios.post(`${GRAPH_API_BASE}/${uploadSessionId}`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${accessToken}`,
          },
        });

        offset += chunk.length;
      }

      return uploadSessionId;
    } catch (error) {
      console.error('[InstagramService] Upload error:', error);
      return null;
    }
  }

  /**
   * Wait for container to be ready
   */
  private async waitForContainerReady(
    containerId: string,
    accessToken: string,
    maxWaitTime = 300000,
  ): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = 5000;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await axios.get(`${GRAPH_API_BASE}/${containerId}`, {
          params: { access_token: accessToken, fields: 'status_code,status' },
        });

        const statusCode = response.data.status_code;

        if (statusCode === 'FINISHED') {
          return true;
        } else if (statusCode === 'ERROR') {
          return false;
        }

        await this.sleep(pollInterval);
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Publish video to Instagram Reels
   */
  async publish(
    contentId: string,
    filePath: string,
    metadata?: PublishMetadata,
    _scheduledPublishAt?: string,
  ): Promise<PublishResult> {
    try {
      const userId = new ObjectId(contentId); // TODO: Get userId properly
      const token = await this.oauthService.getToken(
        userId,
        OAuthPlatform.INSTAGRAM,
      );

      if (!token) {
        throw new Error('Instagram not connected');
      }

      const accessToken = token.accessToken;
      const accountId = token.accountId;

      if (!accountId) {
        throw new Error('Instagram account ID not found');
      }

      // Step 1: Upload video using resumable upload
      const uploadUrl = await this.uploadVideo(
        accountId,
        filePath,
        accessToken,
      );

      if (!uploadUrl) {
        throw new Error('Failed to upload video');
      }

      // Step 2: Create media container
      const containerId = await this.createMediaContainer(
        accountId,
        uploadUrl,
        accessToken,
        metadata,
      );

      if (!containerId) {
        throw new Error('Failed to create media container');
      }

      // Step 3: Wait for container to be ready
      const ready = await this.waitForContainerReady(containerId, accessToken);

      if (!ready) {
        throw new Error('Media container failed to process');
      }

      // Step 4: Publish the container
      const postId = await this.publishContainer(
        containerId,
        accountId,
        accessToken,
      );

      if (!postId) {
        throw new Error('Failed to publish media');
      }

      return { postId, success: true };
    } catch (error) {
      console.error('[InstagramService] Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }
}
