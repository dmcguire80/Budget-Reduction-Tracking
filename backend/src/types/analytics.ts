/**
 * Monthly breakdown for payoff projection
 */
export interface MonthlyBreakdown {
  month: number;
  balance: number;
  interestCharged: number;
  paymentAmount: number;
  principalPaid: number;
}

/**
 * Payoff projection result
 */
export interface PayoffProjection {
  months: number;
  totalInterest: number;
  finalBalance: number;
  monthlyBreakdown: MonthlyBreakdown[];
  error?: string;
}

/**
 * Overall user analytics
 */
export interface OverallAnalytics {
  totalDebt: number;
  totalReduction: number;
  reductionPercentage: number;
  totalAccounts: number;
  activeAccounts: number;
  averageMonthlyReduction: number;
  totalInterestPaid: number;
  projectedDebtFreeDate: Date | null;
  monthlyTrend: MonthlyTrend[];
}

/**
 * Monthly trend data point
 */
export interface MonthlyTrend {
  month: string;
  totalBalance: number;
  reduction: number;
}

/**
 * Per-account analytics
 */
export interface AccountAnalytics {
  currentBalance: number;
  initialBalance: number;
  totalReduction: number;
  reductionPercentage: number;
  totalPayments: number;
  totalCharges: number;
  totalInterest: number;
  averageMonthlyPayment: number;
  averageMonthlyReduction: number;
  daysInProgram: number;
  projectedPayoffDate: Date | null;
  projectedTotalInterest: number;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  paymentConsistency: number;
  reductionRate: number;
  monthOverMonthComparison: MonthOverMonthData[];
}

/**
 * Month-over-month comparison data point
 */
export interface MonthOverMonthData {
  period: string;
  balance: number;
  change: number;
  changePercentage: number;
}

/**
 * Chart dataset configuration
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  type?: 'line' | 'bar';
}

/**
 * Chart data structure (Chart.js compatible)
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Interest history entry
 */
export interface InterestHistoryEntry {
  month: string;
  interestAmount: number;
  balance: number;
}

/**
 * Payoff scenario comparison
 */
export interface PayoffScenario {
  name: string;
  monthlyPayment: number;
  months: number;
  totalInterest: number;
  totalPaid: number;
}

/**
 * Projection request parameters
 */
export interface ProjectionRequest {
  accountId: string;
  monthlyPayment: number;
  extraPayment?: number;
}

/**
 * Date range parameters
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}
