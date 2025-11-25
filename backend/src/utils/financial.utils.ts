/**
 * Financial utility functions for calculations and formatting
 */

/**
 * Calculate the number of months between two dates
 * @param startDate - Starting date
 * @param endDate - Ending date
 * @returns Number of months (rounded)
 */
export const getMonthsDifference = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();

  return yearsDiff * 12 + monthsDiff;
};

/**
 * Add specified number of months to a date
 * @param date - Base date
 * @param months - Number of months to add
 * @returns New date with months added
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Get month label in "MMM YYYY" format
 * @param date - Date to format
 * @returns Formatted month label (e.g., "Jan 2025")
 */
export const getMonthLabel = (date: Date): string => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};

/**
 * Get month/year label in "YYYY-MM" format for grouping
 * @param date - Date to format
 * @returns Formatted month key (e.g., "2025-01")
 */
export const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Calculate mean (average) of an array of numbers
 * @param values - Array of numbers
 * @returns Mean value or 0 if array is empty
 */
export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Calculate median of an array of numbers
 * @param values - Array of numbers
 * @returns Median value or 0 if array is empty
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

/**
 * Determine trend direction based on array of values
 * @param values - Array of numbers (ordered chronologically)
 * @returns Trend direction
 */
export const calculateTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable';

  // Calculate simple linear regression slope
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Threshold for considering trend as stable
  const threshold = 0.01;

  if (Math.abs(slope) < threshold) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
};

/**
 * Calculate growth rate between two values
 * @param oldValue - Starting value
 * @param newValue - Ending value
 * @returns Growth rate as percentage (positive = growth, negative = decline)
 */
export const calculateGrowthRate = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }

  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Round currency amount to 2 decimal places
 * @param amount - Amount to round
 * @returns Rounded amount
 */
export const roundCurrency = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

/**
 * Format number as currency string
 * @param amount - Amount to format
 * @param includeCents - Whether to include cents (default: true)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number, includeCents: boolean = true): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  };

  return new Intl.NumberFormat('en-US', options).format(amount);
};

/**
 * Calculate percentage with safe division
 * @param part - Part value
 * @param whole - Whole value
 * @returns Percentage (0-100) or 0 if whole is 0
 */
export const calculatePercentage = (part: number, whole: number): number => {
  if (whole === 0) return 0;
  return roundCurrency((part / whole) * 100);
};

/**
 * Calculate days between two dates
 * @param startDate - Starting date
 * @param endDate - Ending date
 * @returns Number of days
 */
export const getDaysDifference = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate standard deviation of an array of numbers
 * @param values - Array of numbers
 * @returns Standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDiffs);

  return Math.sqrt(variance);
};

/**
 * Check if a payment is consistent (within threshold of mean)
 * @param payment - Payment amount
 * @param meanPayment - Mean payment amount
 * @param threshold - Threshold percentage (default: 20%)
 * @returns True if payment is consistent
 */
export const isPaymentConsistent = (
  payment: number,
  meanPayment: number,
  threshold: number = 0.2
): boolean => {
  if (meanPayment === 0) return payment === 0;

  const deviation = Math.abs(payment - meanPayment) / meanPayment;
  return deviation <= threshold;
};
