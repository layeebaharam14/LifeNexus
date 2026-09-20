export interface IStorageService {
  saveFile(userId: string, documentId: string, filename: string, buffer: Buffer): Promise<string>;
  getFile(storagePath: string): Promise<Buffer | null>;
  deleteFile(storagePath: string): Promise<boolean>;
  fileExists(storagePath: string): Promise<boolean>;
}
