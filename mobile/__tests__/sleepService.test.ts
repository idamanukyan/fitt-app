/**
 * Sleep Service Tests
 *
 * Unit tests for the sleep tracking service functionality.
 */

// Mock the API client
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { sleepService, formatDateToISO, getMonthDateRange } from '../services/sleepService';

describe('Sleep Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDateToISO', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date('2024-03-15T10:30:00');
      const result = formatDateToISO(date);
      expect(result).toBe('2024-03-15');
    });

    it('should handle dates with single digit month/day', () => {
      const date = new Date('2024-01-05T10:30:00');
      const result = formatDateToISO(date);
      expect(result).toBe('2024-01-05');
    });
  });

  describe('getMonthDateRange', () => {
    it('should return correct start and end dates for a month', () => {
      const result = getMonthDateRange(2024, 0); // January 2024
      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2024-01-31');
    });

    it('should handle February in leap year', () => {
      const result = getMonthDateRange(2024, 1); // February 2024 (leap year)
      expect(result.start).toBe('2024-02-01');
      expect(result.end).toBe('2024-02-29');
    });

    it('should handle December', () => {
      const result = getMonthDateRange(2024, 11); // December 2024
      expect(result.start).toBe('2024-12-01');
      expect(result.end).toBe('2024-12-31');
    });
  });

  describe('getSleepStatus', () => {
    it('should return "great" for 7-9 hours of sleep', () => {
      expect(sleepService.getSleepStatus(7.5)).toBe('great');
      expect(sleepService.getSleepStatus(8)).toBe('great');
    });

    it('should return "good" for 6-7 hours of sleep', () => {
      expect(sleepService.getSleepStatus(6.5)).toBe('good');
    });

    it('should return "poor" for less than 6 hours of sleep', () => {
      expect(sleepService.getSleepStatus(5)).toBe('poor');
      expect(sleepService.getSleepStatus(4)).toBe('poor');
    });

    it('should return "excessive" for more than 9 hours of sleep', () => {
      expect(sleepService.getSleepStatus(10)).toBe('excessive');
    });
  });

  describe('checkHealthPlatformAvailability', () => {
    it('should return platform availability', async () => {
      const result = await sleepService.checkHealthPlatformAvailability();
      expect(result).toHaveProperty('appleHealth');
      expect(result).toHaveProperty('googleFit');
      expect(typeof result.appleHealth).toBe('boolean');
      expect(typeof result.googleFit).toBe('boolean');
    });
  });
});
