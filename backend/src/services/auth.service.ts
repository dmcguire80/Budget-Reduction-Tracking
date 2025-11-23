import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * User response type (without password)
 */
interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication response type
 */
interface AuthResponse {
  user: UserResponse;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Register a new user
 * @param email - User email
 * @param password - Plain text password
 * @param name - User name
 * @returns User object and tokens
 * @throws ConflictError if email already exists
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  // Log registration event
  logger.info(`User registered: ${user.email}`, { userId: user.id });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  // Return user (without password) and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

/**
 * Login user with email and password
 * @param email - User email
 * @param password - Plain text password
 * @returns User object and tokens
 * @throws UnauthorizedError if credentials are invalid
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Log login event
  logger.info(`User logged in: ${user.email}`, { userId: user.id });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  // Return user (without password) and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

/**
 * Refresh access token using refresh token
 * @param refreshToken - JWT refresh token
 * @returns New access token
 * @throws UnauthorizedError if refresh token is invalid or user not found
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Generate new access token
  const accessToken = generateAccessToken(user.id, user.email);

  return { accessToken };
};

/**
 * Logout user
 * Placeholder for future token blacklist implementation
 * @param userId - User ID
 */
export const logoutUser = async (userId: string): Promise<void> => {
  // Log logout event
  logger.info(`User logged out`, { userId });

  // TODO: Implement token blacklist
  // For now, client-side token deletion is sufficient
  // Future enhancement: Add token to Redis blacklist with TTL
};
