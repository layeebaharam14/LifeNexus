import { app } from './app.js';
import { ENV } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function startServer(): Promise<void> {
  try {
    if (!ENV.PORT || isNaN(ENV.PORT)) {
      throw new Error(`Invalid PORT configuration: ${ENV.PORT}`);
    }

    // Connect Database Layer
    await connectDatabase();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`==================================================`);
      logger.info(` LIFENEXUS API Server running in ${ENV.NODE_ENV} mode`);
      logger.info(` Port: ${ENV.PORT}`);
      logger.info(` Health endpoint: http://localhost:${ENV.PORT}/api/health`);
      logger.info(` Auth endpoints:  http://localhost:${ENV.PORT}/api/auth/*`);
      logger.info(`==================================================`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${ENV.PORT} is already in use! Another LIFENEXUS backend instance is already running.`);
        logger.error(`You do not need to start it again — your backend is already running at http://localhost:${ENV.PORT}`);
      } else {
        logger.error('Server error:', err);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start LIFENEXUS Server:', error);
    process.exit(1);
  }
}

startServer();
