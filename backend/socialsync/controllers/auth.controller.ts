import { ObjectId } from '@mikro-orm/mongodb';
import { Controller, Post, Get, Query, Body } from '@nestjs/common';

import { OAuthPlatform } from '../entities/oauth-token.entity';
import { OAuthService } from '../services/oauth.service';

@Controller('socialsync/auth')
export class AuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Check if user has valid token
   */
  @Get('status')
  async checkStatus(
    @Query('userId') userId: string,
    @Query('platform') platform: OAuthPlatform,
  ) {
    const hasToken = await this.oauthService.hasValidToken(
      new ObjectId(userId),
      platform,
    );

    return {
      connected: hasToken,
      platform,
      success: true,
    };
  }

  /**
   * Disconnect platform
   */
  @Post('disconnect')
  async disconnect(
    @Body('userId') userId: string,
    @Body('platform') platform: OAuthPlatform,
  ) {
    await this.oauthService.deleteToken(new ObjectId(userId), platform);

    return {
      message: `Disconnected from ${platform}`,
      success: true,
    };
  }

  /**
   * Save OAuth tokens
   */
  @Post('token')
  async saveToken(
    @Body('userId') userId: string,
    @Body('platform') platform: OAuthPlatform,
    @Body('accessToken') accessToken: string,
    @Body('refreshToken') refreshToken?: string,
    @Body('expiresAt') expiresAt?: string,
    @Body('accountId') accountId?: string,
    @Body('scope') scope?: string,
  ) {
    await this.oauthService.saveToken(
      new ObjectId(userId),
      platform,
      accessToken,
      refreshToken,
      expiresAt ? new Date(expiresAt) : undefined,
      accountId,
      scope,
    );

    return {
      message: 'Token saved successfully',
      success: true,
    };
  }
}
