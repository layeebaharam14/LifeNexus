import jwt from 'jsonwebtoken';
import { ENV } from '../../config/environment.js';
import { UserTokenPayload } from '../../types/api.js';

export function generateToken(payload: UserTokenPayload): string {
  // Sign JWT with configured secret and expiration
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as UserTokenPayload;
    if (decoded && decoded.userId) {
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    }
    return null;
  } catch (_error) {
    return null;
  }
}
