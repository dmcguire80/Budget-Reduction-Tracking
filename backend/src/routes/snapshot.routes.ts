import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as snapshotController from '../controllers/snapshot.controller';
import { createSnapshotSchema } from '../validators/snapshot.validator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/accounts/:accountId/snapshots
 * @desc    Get all snapshots for an account
 * @access  Protected
 */
router.get(
  '/accounts/:accountId/snapshots',
  asyncHandler(snapshotController.getAccountSnapshots)
);

/**
 * @route   GET /api/accounts/:accountId/snapshots/chart-data
 * @desc    Get chart data for an account
 * @access  Protected
 */
router.get(
  '/accounts/:accountId/snapshots/chart-data',
  asyncHandler(snapshotController.getChartData)
);

/**
 * @route   POST /api/accounts/:accountId/snapshots
 * @desc    Create manual snapshot for an account
 * @access  Protected
 */
router.post(
  '/accounts/:accountId/snapshots',
  validate(createSnapshotSchema),
  asyncHandler(snapshotController.createSnapshot)
);

/**
 * @route   DELETE /api/snapshots/:id
 * @desc    Delete snapshot
 * @access  Protected
 */
router.delete('/snapshots/:id', asyncHandler(snapshotController.deleteSnapshot));

export default router;
