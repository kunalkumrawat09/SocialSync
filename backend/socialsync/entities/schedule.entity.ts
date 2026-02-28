import { Entity, Property, PrimaryKey, Index, Enum } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { Platform } from './queue-item.entity';

@Entity({ collection: 'socialsync_schedules' })
@Index({ properties: ['userId', 'platform'] })
export class Schedule {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ nullable: true })
  channelId?: ObjectId; // For YouTube multi-channel scheduling

  @Property()
  createdAt: Date = new Date();

  @Property({ type: 'array' })
  days!: number[]; // 0-6 (Sunday-Saturday)

  @Property()
  enabled = true;

  @Enum(() => Platform)
  @Index()
  platform!: Platform;

  @Property({ type: 'array' })
  times!: string[]; // ["09:00", "15:00", "21:00"]

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  @Index()
  userId!: ObjectId;
}
