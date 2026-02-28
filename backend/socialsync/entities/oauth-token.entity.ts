import { Entity, Property, PrimaryKey, Index, Enum } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export enum OAuthPlatform {
  GOOGLE = 'google',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
}

@Entity({ collection: 'socialsync_oauth_tokens' })
@Index({ properties: ['userId', 'platform'] }, { unique: true })
export class OAuthToken {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  accessToken!: string; // Should be encrypted

  @Property()
  accountId?: string; // Platform-specific account ID

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  expiresAt?: Date;

  @Enum(() => OAuthPlatform)
  @Index()
  platform!: OAuthPlatform;

  @Property({ nullable: true })
  refreshToken?: string; // Should be encrypted

  @Property({ nullable: true })
  scope?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  @Index()
  userId!: ObjectId;
}
