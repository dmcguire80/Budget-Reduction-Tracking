import { describe, it, expect } from '@jest/globals';
import { calculatePayoffProjection } from '../../services/projection.service';

describe('ProjectionService', () => {
  describe('calculatePayoffProjection', () => {
    it('should calculate correct payoff for basic scenario', () => {
      const result = calculatePayoffProjection(1000, 18, 100);

      expect(result.months).toBeGreaterThan(0);
      expect(result.months).toBeLessThan(12);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.finalBalance).toBe(0);
      expect(result.monthlyBreakdown).toHaveLength(result.months);
    });

    it('should return zero months when balance is zero', () => {
      const result = calculatePayoffProjection(0, 18, 100);

      expect(result.months).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.finalBalance).toBe(0);
      expect(result.monthlyBreakdown).toHaveLength(0);
    });

    it('should return zero months when balance is negative', () => {
      const result = calculatePayoffProjection(-100, 18, 100);

      expect(result.months).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.finalBalance).toBe(0);
    });

    it('should return error when payment is zero', () => {
      const result = calculatePayoffProjection(1000, 18, 0);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('must be greater than zero');
    });

    it('should return error when payment is negative', () => {
      const result = calculatePayoffProjection(1000, 18, -50);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('must be greater than zero');
    });

    it('should return error when payment does not exceed interest', () => {
      // At 18% APR on $1000, monthly interest is ~$15
      const result = calculatePayoffProjection(1000, 18, 10);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('must exceed monthly interest');
      expect(result.months).toBe(600); // Maxed out
    });

    it('should handle zero interest rate', () => {
      const result = calculatePayoffProjection(1000, 0, 100);

      expect(result.months).toBe(10); // 1000 / 100
      expect(result.totalInterest).toBe(0);
      expect(result.finalBalance).toBe(0);
    });

    it('should calculate monthly breakdown correctly', () => {
      const result = calculatePayoffProjection(1000, 18, 100);

      // Check first month
      const firstMonth = result.monthlyBreakdown[0];
      expect(firstMonth.month).toBe(1);
      expect(firstMonth.interestCharged).toBeCloseTo(15, 0); // ~1.5% of 1000
      expect(firstMonth.paymentAmount).toBe(100);
      expect(firstMonth.principalPaid).toBeCloseTo(85, 0); // 100 - 15
      expect(firstMonth.balance).toBeCloseTo(915, 0); // 1000 + 15 - 100

      // Check last month has zero balance
      const lastMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
      expect(lastMonth.balance).toBe(0);
    });

    it('should handle high interest rate correctly', () => {
      const result = calculatePayoffProjection(5000, 24.99, 200);

      expect(result.months).toBeGreaterThan(30); // Will take longer with high interest
      expect(result.totalInterest).toBeGreaterThan(500);
      expect(result.finalBalance).toBe(0);
    });

    it('should handle low monthly payment correctly', () => {
      const result = calculatePayoffProjection(1000, 12, 30);

      // With low payment, takes longer to pay off
      expect(result.months).toBeGreaterThan(30);
      expect(result.finalBalance).toBe(0);
    });

    it('should handle large balance correctly', () => {
      const result = calculatePayoffProjection(50000, 18, 1000);

      expect(result.months).toBeGreaterThan(50);
      expect(result.finalBalance).toBe(0);
      expect(result.totalInterest).toBeGreaterThan(1000);
    });

    it('should ensure balance decreases each month', () => {
      const result = calculatePayoffProjection(1000, 18, 100);

      for (let i = 1; i < result.monthlyBreakdown.length; i++) {
        const prevBalance = result.monthlyBreakdown[i - 1].balance;
        const currentBalance = result.monthlyBreakdown[i].balance;
        expect(currentBalance).toBeLessThan(prevBalance);
      }
    });

    it('should ensure principal paid is positive each month', () => {
      const result = calculatePayoffProjection(1000, 18, 100);

      result.monthlyBreakdown.forEach((month) => {
        expect(month.principalPaid).toBeGreaterThan(0);
      });
    });

    it('should handle edge case where payment equals balance plus interest in first month', () => {
      const result = calculatePayoffProjection(90, 18, 100);

      expect(result.months).toBe(1);
      expect(result.finalBalance).toBe(0);
    });

    it('should cap at maximum months for impossible scenarios', () => {
      const result = calculatePayoffProjection(1000000, 5, 100);

      expect(result.months).toBeLessThanOrEqual(600);
    });

    it('should ensure final payment does not exceed remaining balance', () => {
      const result = calculatePayoffProjection(250, 12, 100);

      const lastMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
      expect(lastMonth.paymentAmount).toBeLessThanOrEqual(100);
      expect(lastMonth.balance).toBe(0);
    });
  });
});
