import { Entity, Property, PrimaryKey, Index } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({ collection: 'socialsync_youtube_channels' })
@Index({ properties: ['userId'] })
@Index({ properties: ['channelId'] })
export class YouTubeChannel {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ nullable: true })
  channelHandle?: string; // @username

  @Property()
  @Index()
  channelId!: string; // YouTube channel ID

  @Property()
  channelName!: string;

  @Property()
  createdAt: Date = new Date();

  @Property()
  dailyQuota = 6;

  @Property({ nullable: true })
  driveFolderId?: string;

  @Property()
  enabled = true;

  @Property()
  postingIntervalMinutes = 30;

  @Property({ nullable: true })
  thumbnailUrl?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  @Index()
  userId!: ObjectId;
}
