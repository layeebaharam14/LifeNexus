import mongoose from 'mongoose';
import { ENV } from './environment.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase(): Promise<void> {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Database connection failure:', error);
    logger.warn('Running with degraded in-memory capabilities or waiting for DB to become available.');
  }
}
