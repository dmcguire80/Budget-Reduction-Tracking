import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatAccountType,
  formatTransactionType,
  truncateText,
  formatFileSize,
  formatRelativeTime,
  pluralize,
} from '../format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency with cents by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format currency without cents when specified', () => {
      expect(formatCurrency(1234.56, false)).toBe('$1,235');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should format number with decimals', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234, 0)).toBe('-1,234');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
    });

    it('should format percentage value', () => {
      expect(formatPercentage(50, 1, false)).toBe('50.0%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle custom decimals', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
    });

    it('should handle negative percentages', () => {
      expect(formatPercentage(-0.25)).toBe('-25.0%');
    });

    it('should handle percentages over 100', () => {
      expect(formatPercentage(1.5)).toBe('150.0%');
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('should format ISO string', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toContain('2024');
    });

    it('should return "Invalid date" for invalid input', () => {
      expect(formatDate('invalid-date')).toBe('Invalid date');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('2024');
    });
  });

  describe('formatAccountType', () => {
    it('should format CREDIT_CARD', () => {
      expect(formatAccountType('CREDIT_CARD')).toBe('Credit Card');
    });

    it('should format PERSONAL_LOAN', () => {
      expect(formatAccountType('PERSONAL_LOAN')).toBe('Personal Loan');
    });

    it('should format AUTO_LOAN', () => {
      expect(formatAccountType('AUTO_LOAN')).toBe('Auto Loan');
    });

    it('should format MORTGAGE', () => {
      expect(formatAccountType('MORTGAGE')).toBe('Mortgage');
    });

    it('should format STUDENT_LOAN', () => {
      expect(formatAccountType('STUDENT_LOAN')).toBe('Student Loan');
    });
  });

  describe('formatTransactionType', () => {
    it('should format PAYMENT', () => {
      expect(formatTransactionType('PAYMENT')).toBe('Payment');
    });

    it('should format CHARGE', () => {
      expect(formatTransactionType('CHARGE')).toBe('Charge');
    });

    it('should format INTEREST', () => {
      expect(formatTransactionType('INTEREST')).toBe('Interest');
    });

    it('should format ADJUSTMENT', () => {
      expect(formatTransactionType('ADJUSTMENT')).toBe('Adjustment');
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than max length', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });

    it('should truncate text longer than max length', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is...');
    });

    it('should use custom suffix', () => {
      expect(truncateText('This is a very long text', 10, '…')).toBe('This is a…');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exactly 10', 10)).toBe('Exactly 10');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle large numbers', () => {
      expect(formatFileSize(1536 * 1024 * 1024)).toBe('1.50 GB');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('5 minutes ago');
    });

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 3 * 3600 * 1000);
      expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    it('should format days ago', () => {
      const date = new Date(Date.now() - 2 * 86400 * 1000);
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should format weeks ago', () => {
      const date = new Date(Date.now() - 2 * 604800 * 1000);
      expect(formatRelativeTime(date)).toBe('2 weeks ago');
    });

    it('should handle singular units', () => {
      const date = new Date(Date.now() - 61 * 1000);
      expect(formatRelativeTime(date)).toBe('1 minute ago');
    });
  });

  describe('pluralize', () => {
    it('should return singular for count of 1', () => {
      expect(pluralize(1, 'item')).toBe('item');
    });

    it('should return plural for count > 1', () => {
      expect(pluralize(2, 'item')).toBe('items');
    });

    it('should return plural for count of 0', () => {
      expect(pluralize(0, 'item')).toBe('items');
    });

    it('should use custom plural form', () => {
      expect(pluralize(2, 'child', 'children')).toBe('children');
    });

    it('should handle negative counts as plural', () => {
      expect(pluralize(-5, 'item')).toBe('items');
    });
  });
});
