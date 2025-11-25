import { Request, Response, NextFunction } from 'express';
import * as snapshotService from '../services/snapshot.service';
import {
  CreateSnapshotInput,
  SnapshotFiltersInput,
} from '../validators/snapshot.validator';

/**
 * Get all snapshots for an account
 * @route GET /api/accounts/:accountId/snapshots
 */
export const getAccountSnapshots = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    const filters = req.query as unknown as SnapshotFiltersInput;

    const snapshots = await snapshotService.getAccountSnapshots(
      accountId,
      userId,
      filters
    );

    res.status(200).json({
      success: true,
      data: { snapshots, total: snapshots.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a manual snapshot
 * @route POST /api/accounts/:accountId/snapshots
 */
export const createSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    const data = req.body as CreateSnapshotInput;

    const snapshot = await snapshotService.createSnapshot(
      accountId,
      userId,
      data
    );

    res.status(201).json({
      success: true,
      message: 'Snapshot created successfully',
      data: { snapshot },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a snapshot
 * @route DELETE /api/snapshots/:id
 */
export const deleteSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await snapshotService.deleteSnapshot(id, userId);

    res.status(200).json({
      success: true,
      message: 'Snapshot deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chart data for an account
 * @route GET /api/accounts/:accountId/snapshots/chart-data
 */
export const getChartData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    const filters = req.query as unknown as SnapshotFiltersInput;

    const chartData = await snapshotService.getChartData(
      accountId,
      userId,
      filters
    );

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};
