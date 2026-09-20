import { UserTokenPayload } from './api.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}
