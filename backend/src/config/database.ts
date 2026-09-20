import mongoose from 'mongoose';
import { ENV } from './environment.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase(): Promise<void> {
  if (!ENV.MONGODB_URI) {
    logger.warn('MONGODB_URI is not set. Running with resilient memory persistence.');
    return;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    logger.warn(`MongoDB not reachable at ${ENV.MONGODB_URI.split('@').pop()}. Using in-memory fallback store.`);
  }
}
