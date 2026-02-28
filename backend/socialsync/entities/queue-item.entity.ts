import { Entity, Property, PrimaryKey, Index, Enum } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export enum Platform {
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
}

export enum QueueStatus {
  FAILED = 'failed',
  PENDING = 'pending',
  POSTED = 'posted',
  PROCESSING = 'processing',
  SCHEDULED = 'scheduled', // For YouTube native scheduling
  SKIPPED = 'skipped',
}

@Entity({ collection: 'socialsync_queue' })
@Index({ properties: ['userId', 'status'] })
@Index({ properties: ['contentId'] })
@Index({ properties: ['scheduledFor'] })
@Index({ properties: ['platform', 'status'] })
export class QueueItem {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ nullable: true })
  accountId?: ObjectId;

  @Property()
  attempts = 0;

  @Property({ nullable: true })
  channelId?: ObjectId; // For YouTube multi-channel

  @Property()
  contentId!: ObjectId;

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  lastError?: string;

  @Property({ nullable: true })
  logoCheckedAt?: Date;

  @Property({ nullable: true })
  logoConfidence?: number;

  @Property({ nullable: true })
  logoDetected?: boolean;

  @Enum(() => Platform)
  @Index()
  platform!: Platform;

  @Property({ nullable: true })
  platformPostId?: string;

  @Property({ nullable: true })
  postedAt?: Date;

  @Property({ nullable: true })
  @Index()
  scheduledFor?: Date;

  @Enum(() => QueueStatus)
  @Index()
  status: QueueStatus = QueueStatus.PENDING;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  @Index()
  userId!: ObjectId;

  // YouTube-specific fields
  @Property({ nullable: true })
  youtubeScheduledPublishAt?: Date;

  @Property({ nullable: true })
  youtubeVideoUrl?: string;
}
