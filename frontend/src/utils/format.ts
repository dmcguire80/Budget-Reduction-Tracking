/**
 * Formatting Utilities
 *
 * Functions for formatting currency, dates, numbers, and percentages
 */

import { format, parseISO } from 'date-fns';
import { CURRENCY, DATE_FORMATS } from '@config/constants';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param includeCents - Whether to include cents (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, includeCents = true): string => {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount);
};

/**
 * Format a date string or Date object
 * @param date - The date to format
 * @param formatString - The format string (default: DISPLAY)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  formatString: string = DATE_FORMATS.DISPLAY
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string or Date object with time
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Format a number with thousand separators
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format a number as a percentage
 * @param num - The number to format (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @param isDecimal - Whether the input is a decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  num: number,
  decimals = 1,
  isDecimal = true
): string => {
  const percentage = isDecimal ? num * 100 : num;
  return `${formatNumber(percentage, decimals)}%`;
};

/**
 * Format account type for display
 * @param accountType - The account type enum value
 * @returns Formatted account type string
 */
export const formatAccountType = (accountType: string): string => {
  return accountType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format transaction type for display
 * @param transactionType - The transaction type enum value
 * @returns Formatted transaction type string
 */
export const formatTransactionType = (transactionType: string): string => {
  return transactionType.charAt(0) + transactionType.slice(1).toLowerCase();
};

/**
 * Truncate text to a maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncating
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - The number of bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${formatNumber(size, unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
};

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Pluralize a word based on count
 * @param count - The count
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (default: singular + 's')
 * @returns Pluralized word
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  return count === 1 ? singular : plural || `${singular}s`;
};
