import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth/tokenService.js';
import { ApiResponse } from '../types/api.js';

export function authenticateUser(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication token is empty.',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
    return;
  }

  // Attach verified user identity to Request
  req.user = {
    userId: payload.userId,
    email: payload.email,
  };

  next();
}
