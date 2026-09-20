import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, IUser } from '../../models/User.js';
import { generateToken } from './tokenService.js';

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResult {
  user: UserResponseDTO;
  token: string;
}

// In-memory fallback cache for standalone local execution without Mongo daemon
interface MemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
const inMemoryUsers: Map<string, MemoryUser> = new Map();

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  // Salt and hash password (10 rounds)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (isDbConnected()) {
    // Check for existing user in MongoDB
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });

    const userDTO: UserResponseDTO = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt.toISOString(),
    };

    const token = generateToken({
      userId: userDTO.id,
      email: userDTO.email,
    });

    return { user: userDTO, token };
  } else {
    // In-memory fallback
    if (inMemoryUsers.has(normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const memoryUser: MemoryUser = {
      id,
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
    };

    inMemoryUsers.set(normalizedEmail, memoryUser);

    const userDTO: UserResponseDTO = {
      id: memoryUser.id,
      name: memoryUser.name,
      email: memoryUser.email,
      createdAt: memoryUser.createdAt.toISOString(),
    };

    const token = generateToken({
      userId: userDTO.id,
      email: userDTO.email,
    });

    return { user: userDTO, token };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  let userRecord: { id: string; name: string; email: string; passwordHash: string; createdAt?: Date } | null = null;

  if (isDbConnected()) {
    const dbUser = await User.findOne({ email: normalizedEmail });
    if (dbUser) {
      userRecord = {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        createdAt: dbUser.createdAt,
      };
    }
  } else {
    const memUser = inMemoryUsers.get(normalizedEmail);
    if (memUser) {
      userRecord = memUser;
    }
  }

  if (!userRecord) {
    throw new Error('Invalid email or password.');
  }

  // Secure password comparison
  const isMatch = await bcrypt.compare(password, userRecord.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  const userDTO: UserResponseDTO = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    createdAt: userRecord.createdAt ? userRecord.createdAt.toISOString() : new Date().toISOString(),
  };

  const token = generateToken({
    userId: userDTO.id,
    email: userDTO.email,
  });

  return { user: userDTO, token };
}

export async function getUserById(userId: string): Promise<UserResponseDTO | null> {
  if (isDbConnected()) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    const dbUser = await User.findById(userId);
    if (!dbUser) return null;
    return {
      id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      createdAt: dbUser.createdAt.toISOString(),
    };
  } else {
    for (const memUser of inMemoryUsers.values()) {
      if (memUser.id === userId) {
        return {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          createdAt: memUser.createdAt.toISOString(),
        };
      }
    }
    return null;
  }
}
