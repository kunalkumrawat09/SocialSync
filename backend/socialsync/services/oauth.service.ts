import { EntityRepository } from '@mikro-orm/mongodb';
import { ObjectId } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { OAuthToken, OAuthPlatform } from '../entities/oauth-token.entity';

@Injectable()
export class OAuthService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(OAuthToken)
    private readonly tokenRepository: EntityRepository<OAuthToken>,
  ) {
    this.encryptionKey =
      process.env.OAUTH_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  /**
   * Decrypt a token from storage
   */
  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypt a token for secure storage
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Delete OAuth token
   */
  async deleteToken(userId: ObjectId, platform: OAuthPlatform): Promise<void> {
    await this.tokenRepository.nativeDelete({ platform, userId });
  }

  /**
   * Get OAuth token for a user and platform
   */
  async getToken(
    userId: ObjectId,
    platform: OAuthPlatform,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    accountId?: string;
  } | null> {
    const token = await this.tokenRepository.findOne({ platform, userId });

    if (!token) {
      return null;
    }

    return {
      accessToken: this.decrypt(token.accessToken),
      accountId: token.accountId,
      expiresAt: token.expiresAt,
      refreshToken: token.refreshToken
        ? this.decrypt(token.refreshToken)
        : undefined,
    };
  }

  /**
   * Check if user has valid token for platform
   */
  async hasValidToken(
    userId: ObjectId,
    platform: OAuthPlatform,
  ): Promise<boolean> {
    const token = await this.tokenRepository.findOne({ platform, userId });

    if (!token) {
      return false;
    }

    // Check if token is expired
    if (token.expiresAt && token.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Save OAuth tokens for a user
   */
  async saveToken(
    userId: ObjectId,
    platform: OAuthPlatform,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date,
    accountId?: string,
    scope?: string,
  ): Promise<OAuthToken> {
    // Find existing token or create new
    let token = await this.tokenRepository.findOne({ platform, userId });

    if (!token) {
      token = this.tokenRepository.create({
        accessToken: this.encrypt(accessToken),
        accountId,
        expiresAt,
        platform,
        refreshToken: refreshToken ? this.encrypt(refreshToken) : undefined,
        scope,
        userId,
      });
    } else {
      token.accessToken = this.encrypt(accessToken);
      token.refreshToken = refreshToken
        ? this.encrypt(refreshToken)
        : undefined;
      token.expiresAt = expiresAt;
      token.accountId = accountId;
      token.scope = scope;
      token.updatedAt = new Date();
    }

    await this.tokenRepository.persistAndFlush(token);
    return token;
  }
}
