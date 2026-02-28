import { ObjectId } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { google } from 'googleapis';
import * as os from 'os';
import * as path from 'path';

import { OAuthPlatform } from '../entities/oauth-token.entity';
import { OAuthService } from './oauth.service';

@Injectable()
export class DriveService {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Get authenticated Google Drive client
   */
  private async getDriveClient(userId: ObjectId) {
    const token = await this.oauthService.getToken(
      userId,
      OAuthPlatform.GOOGLE,
    );

    if (!token) {
      throw new Error('Google Drive not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    return google.drive({ auth: oauth2Client, version: 'v3' });
  }

  /**
   * Cleanup downloaded file
   */
  cleanupFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Download a file from Google Drive
   */
  async downloadFile(
    userId: ObjectId,
    fileId: string,
    filename: string,
  ): Promise<string> {
    const drive = await this.getDriveClient(userId);

    const tempDir = path.join(os.tmpdir(), 'socialsync');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const destPath = path.join(tempDir, `${fileId}_${filename}`);

    const dest = fs.createWriteStream(destPath);

    const response = await drive.files.get(
      { alt: 'media', fileId },
      { responseType: 'stream' },
    );

    return new Promise((resolve, reject) => {
      response.data
        .on('end', () => {
          resolve(destPath);
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .pipe(dest);
    });
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(userId: ObjectId, fileId: string): Promise<any> {
    const drive = await this.getDriveClient(userId);

    const response = await drive.files.get({
      fields: 'id, name, mimeType, size, createdTime, thumbnailLink',
      fileId,
    });

    return response.data;
  }

  /**
   * List files in a folder
   */
  async listFilesInFolder(
    userId: ObjectId,
    folderId: string,
    mimeTypes: string[] = ['video/mp4', 'video/quicktime', 'video/webm'],
  ): Promise<any[]> {
    const drive = await this.getDriveClient(userId);

    const mimeTypeQuery = mimeTypes
      .map((type) => `mimeType='${type}'`)
      .join(' or ');

    const response = await drive.files.list({
      fields: 'files(id, name, mimeType, size, createdTime, thumbnailLink)',
      pageSize: 1000,
      q: `'${folderId}' in parents and (${mimeTypeQuery}) and trashed=false`,
    });

    return response.data.files || [];
  }
}
