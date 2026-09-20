import { Request, Response } from 'express';
import { registerUser, authenticateUser, getUserById } from '../services/auth/authService.js';
import { ApiResponse } from '../types/api.js';

export async function registerController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid name.',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match.',
      });
      return;
    }

    const authResult = await registerUser(name, email, password);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: authResult,
    });
  } catch (error: any) {
    const isDuplicate = error.message && error.message.includes('already exists');
    res.status(isDuplicate ? 409 : 400).json({
      success: false,
      error: error.message || 'Registration failed.',
    });
  }
}

export async function loginController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
      return;
    }

    const authResult = await authenticateUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: authResult,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials.',
    });
  }
}

export async function getMeController(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing user session.',
      });
      return;
    }

    const user = await getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User account not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Current user profile retrieved',
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve profile.',
    });
  }
}

export async function logoutController(
  _req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}
