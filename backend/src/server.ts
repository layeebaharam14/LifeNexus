import { app } from './app.js';
import { ENV } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Initializing LIFENEXUS Backend Server...');
  
  // Connect Database (MongoDB)
  await connectDatabase();

  // Start HTTP Server
  app.listen(ENV.PORT, () => {
    logger.info(`LIFENEXUS Server listening on port ${ENV.PORT}`);
    logger.info(`Health check available at http://localhost:${ENV.PORT}/api/health`);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal Server Bootstrap Error:', err);
  process.exit(1);
});
