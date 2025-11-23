import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Health check endpoint
router.get(
  '/health',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const timestamp = new Date().toISOString();

    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      res.status(200).json({
        status: 'ok',
        timestamp,
        database: 'connected',
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp,
        database: 'disconnected',
        uptime: process.uptime(),
      });
    }
  })
);

export default router;
