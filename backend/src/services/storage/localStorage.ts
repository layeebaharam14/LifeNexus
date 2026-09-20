import fs from 'fs';
import path from 'path';
import { IStorageService } from './storageService.js';
import { ENV } from '../../config/environment.js';
import { logger } from '../../utils/logger.js';

export class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor(baseDir: string = ENV.UPLOAD_DIR) {
    this.baseDir = path.resolve(baseDir);
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  public async saveFile(
    userId: string,
    documentId: string,
    filename: string,
    buffer: Buffer
  ): Promise<string> {
    const safeUser = this.sanitizeFilename(userId);
    const safeDoc = this.sanitizeFilename(documentId);
    const safeName = this.sanitizeFilename(filename);

    const userDocDir = path.join(this.baseDir, safeUser, safeDoc);
    this.ensureDirectoryExists(userDocDir);

    const fullFilePath = path.join(userDocDir, safeName);
    await fs.promises.writeFile(fullFilePath, buffer);

    // Return relative path for portability across environments
    const relativePath = path.join(safeUser, safeDoc, safeName);
    return relativePath;
  }

  public async getFile(storagePath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.resolve(this.baseDir, storagePath);

      // Guard against directory traversal
      if (!fullPath.startsWith(this.baseDir)) {
        logger.warn(`Potential path traversal attempt detected: ${storagePath}`);
        return null;
      }

      if (!fs.existsSync(fullPath)) {
        return null;
      }

      return await fs.promises.readFile(fullPath);
    } catch (error: any) {
      logger.error(`Error reading file from storage (${storagePath}):`, error);
      return null;
    }
  }

  public async deleteFile(storagePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.baseDir, storagePath);

      if (!fullPath.startsWith(this.baseDir)) {
        logger.warn(`Potential path traversal attempt on delete: ${storagePath}`);
        return false;
      }

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        
        // Clean up parent directory if empty
        const parentDir = path.dirname(fullPath);
        const files = await fs.promises.readdir(parentDir);
        if (files.length === 0) {
          await fs.promises.rmdir(parentDir);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      logger.error(`Error deleting file from storage (${storagePath}):`, error);
      return false;
    }
  }

  public async fileExists(storagePath: string): Promise<boolean> {
    const fullPath = path.resolve(this.baseDir, storagePath);
    if (!fullPath.startsWith(this.baseDir)) return false;
    return fs.existsSync(fullPath);
  }
}

export const storageService = new LocalStorageService();
