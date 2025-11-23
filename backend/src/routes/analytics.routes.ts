import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as analyticsController from '../controllers/analytics.controller';
import {
  customProjectionSchema,
  requiredPaymentSchema,
} from '../validators/analytics.validator';

const router = Router();

// All analytics routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overall analytics overview for authenticated user
 * @access  Protected
 */
router.get('/overview', asyncHandler(analyticsController.getOverview));

/**
 * @route   GET /api/analytics/trends
 * @desc    Get trend analysis for authenticated user
 * @query   period - 'month' | 'quarter' | 'year' (optional, default: 'month')
 * @access  Protected
 */
router.get('/trends', asyncHandler(analyticsController.getTrends));

/**
 * @route   GET /api/analytics/chart/multi-account-balance
 * @desc    Get multi-account balance chart data
 * @query   startDate, endDate - Optional date range
 * @access  Protected
 */
router.get(
  '/chart/multi-account-balance',
  asyncHandler(analyticsController.getMultiAccountBalanceChart)
);

/**
 * @route   GET /api/analytics/accounts/:id
 * @desc    Get analytics summary for a specific account
 * @access  Protected
 */
router.get('/accounts/:id', asyncHandler(analyticsController.getAccountAnalytics));

/**
 * @route   GET /api/analytics/accounts/:id/projection
 * @desc    Get payoff projection for a specific account (based on current trend)
 * @access  Protected
 */
router.get('/accounts/:id/projection', asyncHandler(analyticsController.getAccountProjection));

/**
 * @route   GET /api/analytics/accounts/:id/interest-forecast
 * @desc    Get interest forecast for a specific account
 * @query   months - Number of months to look back (optional, default: 12)
 * @access  Protected
 */
router.get(
  '/accounts/:id/interest-forecast',
  asyncHandler(analyticsController.getInterestForecast)
);

/**
 * @route   GET /api/analytics/accounts/:id/payoff-scenarios
 * @desc    Get multiple payoff scenarios for comparison
 * @access  Protected
 */
router.get(
  '/accounts/:id/payoff-scenarios',
  asyncHandler(analyticsController.getPayoffScenarios)
);

/**
 * @route   POST /api/analytics/accounts/:id/calculate-projection
 * @desc    Calculate custom projection with specified monthly payment
 * @body    { monthlyPayment: number }
 * @access  Protected
 */
router.post(
  '/accounts/:id/calculate-projection',
  validate(customProjectionSchema),
  asyncHandler(analyticsController.calculateCustomProjection)
);

/**
 * @route   POST /api/analytics/accounts/:id/required-payment
 * @desc    Calculate required payment to pay off in target months
 * @body    { targetMonths: number }
 * @access  Protected
 */
router.post(
  '/accounts/:id/required-payment',
  validate(requiredPaymentSchema),
  asyncHandler(analyticsController.getRequiredPayment)
);

/**
 * @route   GET /api/analytics/accounts/:id/chart/balance-reduction
 * @desc    Get balance reduction chart data
 * @query   startDate, endDate - Optional date range
 * @access  Protected
 */
router.get(
  '/accounts/:id/chart/balance-reduction',
  asyncHandler(analyticsController.getBalanceReductionChart)
);

/**
 * @route   GET /api/analytics/accounts/:id/chart/interest-accumulation
 * @desc    Get interest accumulation chart data
 * @query   months - Number of months to display (optional, default: 12)
 * @access  Protected
 */
router.get(
  '/accounts/:id/chart/interest-accumulation',
  asyncHandler(analyticsController.getInterestAccumulationChart)
);

/**
 * @route   GET /api/analytics/accounts/:id/chart/payment-distribution
 * @desc    Get payment distribution pie chart data
 * @access  Protected
 */
router.get(
  '/accounts/:id/chart/payment-distribution',
  asyncHandler(analyticsController.getPaymentDistributionChart)
);

/**
 * @route   GET /api/analytics/accounts/:id/chart/projection-comparison
 * @desc    Get projection comparison chart data (multiple scenarios)
 * @access  Protected
 */
router.get(
  '/accounts/:id/chart/projection-comparison',
  asyncHandler(analyticsController.getProjectionComparisonChart)
);

export default router;
