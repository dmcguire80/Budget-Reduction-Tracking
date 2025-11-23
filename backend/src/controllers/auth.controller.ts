import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator';

/**
 * Handle user registration
 * @route POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body as RegisterInput;

    const result = await authService.registerUser(email, password, name);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 * @route POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle token refresh
 * @route POST /api/auth/refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenInput;

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout
 * @route POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User is attached by requireAuth middleware
    const userId = req.user!.id;

    await authService.logoutUser(userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user information
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User is attached by requireAuth middleware
    const user = req.user!;

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
