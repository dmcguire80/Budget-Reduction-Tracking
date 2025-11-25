import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';

/**
 * Token payload interface
 */
export interface TokenPayload {
  userId: string;
  email?: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Generate JWT access token
 * @param userId - User ID
 * @param email - User email
 * @returns Signed JWT access token
 */
export const generateAccessToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
    type: 'access' as const,
  };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as SignOptions);

  return token;
};

/**
 * Generate JWT refresh token
 * @param userId - User ID
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const payload = {
    userId,
    type: 'refresh' as const,
  };

  const token = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);

  return token;
};

/**
 * Verify and decode access token
 * @param token - JWT access token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;

    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
};

/**
 * Verify and decode refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.REFRESH_TOKEN_SECRET) as TokenPayload;

    // Verify token type
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};
