import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';
import * as projectionService from '../services/projection.service';
import * as interestService from '../services/interest.service';
import * as chartDataService from '../services/chart-data.service';
import {
  CustomProjectionInput,
  TrendAnalysisInput,
  InterestForecastInput,
  ChartDateRangeInput,
  RequiredPaymentInput,
  LookbackPeriodInput,
} from '../validators/analytics.validator';

/**
 * Get overall analytics overview for the authenticated user
 * @route GET /api/analytics/overview
 */
export const getOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const analytics = await analyticsService.getOverallAnalytics(userId);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payoff projection for a specific account
 * @route GET /api/analytics/accounts/:id/projection
 */
export const getAccountProjection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify account ownership (will throw if not authorized)
    await analyticsService.getAccountAnalytics(id, userId);

    // Calculate projection based on current trend
    const projection = await projectionService.calculateCurrentTrendProjection(id);

    res.status(200).json({
      success: true,
      data: projection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interest forecast for a specific account
 * @route GET /api/analytics/accounts/:id/interest-forecast
 */
export const getInterestForecast = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { months } = req.query as unknown as InterestForecastInput;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Get historical interest
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months || 12));

    const history = await interestService.calculateInterestHistory(id, startDate, endDate);

    // Get estimated next month's interest
    const nextMonthEstimate = await interestService.estimateNextMonthInterest(id);

    // Get average monthly interest
    const averageMonthlyInterest = await interestService.calculateAverageMonthlyInterest(
      id,
      months || 12
    );

    res.status(200).json({
      success: true,
      data: {
        history,
        nextMonthEstimate,
        averageMonthlyInterest,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payoff scenarios (what-if analysis) for a specific account
 * @route GET /api/analytics/accounts/:id/payoff-scenarios
 */
export const getPayoffScenarios = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Calculate scenarios
    const scenarios = await projectionService.calculatePayoffScenarios(id);

    res.status(200).json({
      success: true,
      data: { scenarios },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trend analysis for the authenticated user
 * @route GET /api/analytics/trends
 */
export const getTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { period } = req.query as unknown as TrendAnalysisInput;

    const trends = await analyticsService.getTrendAnalysis(userId, period || 'month');

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate custom projection with specified monthly payment
 * @route POST /api/analytics/accounts/:id/calculate-projection
 */
export const calculateCustomProjection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { monthlyPayment } = req.body as CustomProjectionInput;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Calculate custom projection
    const projection = await projectionService.calculateCustomProjection(id, monthlyPayment);

    res.status(200).json({
      success: true,
      data: projection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get account analytics summary
 * @route GET /api/analytics/accounts/:id
 */
export const getAccountAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const analytics = await analyticsService.getAccountAnalytics(id, userId);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get balance reduction chart data
 * @route GET /api/analytics/accounts/:id/chart/balance-reduction
 */
export const getBalanceReductionChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { startDate, endDate } = req.query as unknown as ChartDateRangeInput;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Format chart data
    const dateRange =
      startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : undefined;

    const chartData = await chartDataService.formatBalanceReductionData(id, dateRange);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interest accumulation chart data
 * @route GET /api/analytics/accounts/:id/chart/interest-accumulation
 */
export const getInterestAccumulationChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { months } = req.query as unknown as LookbackPeriodInput;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Format chart data
    const chartData = await chartDataService.formatInterestAccumulationData(id, months || 12);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment distribution chart data (pie chart)
 * @route GET /api/analytics/accounts/:id/chart/payment-distribution
 */
export const getPaymentDistributionChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Format chart data
    const chartData = await chartDataService.formatPaymentDistributionData(id);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get projection comparison chart data
 * @route GET /api/analytics/accounts/:id/chart/projection-comparison
 */
export const getProjectionComparisonChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Format chart data
    const chartData = await chartDataService.formatProjectionComparisonData(id);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get multi-account balance chart data
 * @route GET /api/analytics/chart/multi-account-balance
 */
export const getMultiAccountBalanceChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query as unknown as ChartDateRangeInput;

    // Format chart data
    const dateRange =
      startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : undefined;

    const chartData = await chartDataService.formatMultiAccountBalanceData(userId, dateRange);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate required payment to pay off account in target months
 * @route POST /api/analytics/accounts/:id/required-payment
 */
export const getRequiredPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { targetMonths } = req.body as RequiredPaymentInput;

    // Verify account ownership
    await analyticsService.getAccountAnalytics(id, userId);

    // Calculate required payment
    const requiredPayment = await projectionService.calculateRequiredPayment(id, targetMonths);

    res.status(200).json({
      success: true,
      data: {
        targetMonths,
        requiredPayment,
      },
    });
  } catch (error) {
    next(error);
  }
};
