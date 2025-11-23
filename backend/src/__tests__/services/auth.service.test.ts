import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../../services/auth.service';
import { seedTestUser, clearDatabase } from '../helpers/database';
import { prisma } from '../setup';
import { ConflictError, UnauthorizedError } from '../../middleware/errorHandler';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';

// Mock utilities
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');
jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockPasswordUtils = passwordUtils as jest.Mocked<typeof passwordUtils>;
const mockJwtUtils = jwtUtils as jest.Mocked<typeof jwtUtils>;

describe('AuthService', () => {
  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();

    // Setup default mocks
    mockPasswordUtils.hashPassword.mockResolvedValue('hashed_password');
    mockPasswordUtils.comparePassword.mockResolvedValue(true);
    mockJwtUtils.generateAccessToken.mockReturnValue('mock_access_token');
    mockJwtUtils.generateRefreshToken.mockReturnValue('mock_refresh_token');
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const result = await registerUser('test@example.com', 'password123', 'Test User');

      expect(result).toMatchObject({
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      expect(mockPasswordUtils.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockJwtUtils.generateAccessToken).toHaveBeenCalledWith(
        expect.any(String),
        'test@example.com'
      );
      expect(mockJwtUtils.generateRefreshToken).toHaveBeenCalledWith(expect.any(String));

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
      expect(user?.name).toBe('Test User');
    });

    it('should throw ConflictError when email already exists', async () => {
      // Create a user first
      await seedTestUser('test@example.com');

      // Attempt to register with same email
      await expect(
        registerUser('test@example.com', 'password123', 'Another User')
      ).rejects.toThrow(ConflictError);

      await expect(
        registerUser('test@example.com', 'password123', 'Another User')
      ).rejects.toThrow('User with this email already exists');
    });

    it('should not include password in response', async () => {
      const result = await registerUser('test@example.com', 'password123', 'Test User');

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should create user with hashed password', async () => {
      await registerUser('test@example.com', 'password123', 'Test User');

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user?.passwordHash).toBe('hashed_password');
      expect(mockPasswordUtils.hashPassword).toHaveBeenCalledWith('password123');
    });
  });

  describe('loginUser', () => {
    it('should successfully login with valid credentials', async () => {
      const user = await seedTestUser('test@example.com', 'password123');
      mockPasswordUtils.comparePassword.mockResolvedValue(true);

      const result = await loginUser('test@example.com', 'password123');

      expect(result).toMatchObject({
        user: {
          id: user.id,
          email: 'test@example.com',
          name: user.name,
        },
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      expect(mockPasswordUtils.comparePassword).toHaveBeenCalled();
      expect(mockJwtUtils.generateAccessToken).toHaveBeenCalledWith(user.id, 'test@example.com');
      expect(mockJwtUtils.generateRefreshToken).toHaveBeenCalledWith(user.id);
    });

    it('should throw UnauthorizedError when user not found', async () => {
      await expect(loginUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        UnauthorizedError
      );

      await expect(loginUser('nonexistent@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw UnauthorizedError when password is incorrect', async () => {
      await seedTestUser('test@example.com', 'password123');
      mockPasswordUtils.comparePassword.mockResolvedValue(false);

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedError
      );

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should not include password in response', async () => {
      await seedTestUser('test@example.com', 'password123');
      mockPasswordUtils.comparePassword.mockResolvedValue(true);

      const result = await loginUser('test@example.com', 'password123');

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
      const user = await seedTestUser('test@example.com');
      mockJwtUtils.verifyRefreshToken.mockReturnValue({ userId: user.id });

      const result = await refreshAccessToken('valid_refresh_token');

      expect(result).toEqual({
        accessToken: 'mock_access_token',
      });

      expect(mockJwtUtils.verifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockJwtUtils.generateAccessToken).toHaveBeenCalledWith(user.id, user.email);
    });

    it('should throw UnauthorizedError when user not found', async () => {
      mockJwtUtils.verifyRefreshToken.mockReturnValue({ userId: 'nonexistent-id' });

      await expect(refreshAccessToken('valid_refresh_token')).rejects.toThrow(UnauthorizedError);

      await expect(refreshAccessToken('valid_refresh_token')).rejects.toThrow('User not found');
    });

    it('should throw error when refresh token is invalid', async () => {
      mockJwtUtils.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(refreshAccessToken('invalid_refresh_token')).rejects.toThrow('Invalid token');
    });
  });

  describe('logoutUser', () => {
    it('should successfully logout user', async () => {
      const user = await seedTestUser('test@example.com');

      await expect(logoutUser(user.id)).resolves.toBeUndefined();
    });

    it('should not throw error for non-existent user', async () => {
      await expect(logoutUser('nonexistent-id')).resolves.toBeUndefined();
    });
  });
});
