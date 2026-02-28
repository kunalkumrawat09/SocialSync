import { Entity, Property, PrimaryKey, Index, Enum } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export enum ContentStatus {
  FAILED = 'failed',
  PENDING = 'pending',
  POSTED = 'posted',
  QUEUED = 'queued',
}

export enum ApprovalStatus {
  APPROVED = 'approved',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
}

@Entity({ collection: 'socialsync_content_items' })
@Index({ properties: ['userId', 'status'] })
@Index({ properties: ['driveFileId'] })
@Index({ properties: ['folderId'] })
export class ContentItem {
  @PrimaryKey()
  _id!: ObjectId;

  @Enum(() => ApprovalStatus)
  @Index()
  approvalStatus: ApprovalStatus = ApprovalStatus.PENDING_REVIEW;

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  description?: string;

  @Property()
  discoveredAt: Date = new Date();

  @Property()
  @Index()
  driveFileId!: string;

  @Property({ nullable: true })
  durationSeconds?: number;

  @Property()
  filename!: string;

  @Property()
  folderId!: string;

  @Property({ nullable: true })
  logoCheckedAt?: Date;

  @Property({ nullable: true })
  logoConfidence?: number;

  @Property({ nullable: true })
  logoDetected?: boolean;

  @Property()
  mimeType!: string;

  @Property()
  sizeBytes!: number;

  @Enum(() => ContentStatus)
  @Index()
  status: ContentStatus = ContentStatus.PENDING;

  @Property({ nullable: true, type: 'array' })
  tags?: string[];

  @Property({ nullable: true })
  thumbnailUrl?: string;

  @Property({ nullable: true })
  title?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  @Index()
  userId!: ObjectId;
}
