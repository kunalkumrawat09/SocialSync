export interface PublishResult {
  error?: string;
  postId?: string;
  scheduledFor?: string;
  success: boolean;
}

export interface PublishMetadata {
  [key: string]: unknown;
  caption?: string;
  description?: string;
  tags?: string[];
  title?: string;
}

export interface Publisher {
  /**
   * Publish content to a social media platform
   * @param contentId - ID of the content item
   * @param filePath - Local path to the video file
   * @param metadata - Posting metadata (title, description, tags, etc.)
   * @param scheduledPublishAt - Optional scheduled publish time (for YouTube)
   * @returns PublishResult with success status and post ID
   */
  publish(
    contentId: string,
    filePath: string,
    metadata?: PublishMetadata,
    scheduledPublishAt?: string,
  ): Promise<PublishResult>;
}
