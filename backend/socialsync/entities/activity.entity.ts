import { Entity, Property, PrimaryKey, Index, Enum } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export enum ActivityType {
  CHANNEL_ADDED = 'channel_added',
  CONTENT_DISCOVERED = 'content_discovered',
  OAUTH_CONNECTED = 'oauth_connected',
  POST_FAILED = 'post_failed',
  POST_SUCCESS = 'post_success',
  QUEUE_GENERATED = 'queue_generated',
  SCHEDULE_CREATED = 'schedule_created',
  SCHEDULE_UPDATED = 'schedule_updated',
}

@Entity({ collection: 'socialsync_activity' })
@Index({ properties: ['userId', 'createdAt'] })
@Index({ properties: ['type'] })
export class Activity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  @Index()
  createdAt: Date = new Date();

  @Property()
  message!: string;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @Enum(() => ActivityType)
  @Index()
  type!: ActivityType;

  @Property()
  @Index()
  userId!: ObjectId;
}
