/**
 * Tests for ErrorLogger service
 * Requirements: 7.4, 7.5
 */

import { ErrorLogger, useErrorLogger } from '../errorLogger';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator and window
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)'
  },
});

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test'
  },
});

describe('ErrorLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
  });

  describe('logError', () => {
    it('logs error with all details', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      const logId = ErrorLogger.logError('test-category', 'Test message', error, { userId: '123' });

      expect(logId).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devnotes-error-logs',
        expect.stringContaining('Test message')
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('logs error without error object', () => {
      const logId = ErrorLogger.logError('test-category', 'Test message');

      expect(logId).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('logs error without context', () => {
      const error = new Error('Test error');
      const logId = ErrorLogger.logError('test-category', 'Test message', error);

      expect(logId).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('logWarning', () => {
    it('logs warning message', () => {
      const logId = ErrorLogger.logWarning('test-category', 'Warning message', { data: 'test' });

      expect(logId).toBeDefined();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('logInfo', () => {
    it('logs info message', () => {
      const logId = ErrorLogger.logInfo('test-category', 'Info message', { data: 'test' });

      expect(logId).toBeDefined();
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('getLogs', () => {
    it('returns empty array when no logs exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const logs = ErrorLogger.getLogs();
      expect(logs).toEqual([]);
    });

    it('returns parsed logs from localStorage', () => {
      const testLogs = [
        { id: '1', level: 'error', message: 'Test error' },
        { id: '2', level: 'warning', message: 'Test warning' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const logs = ErrorLogger.getLogs();
      expect(logs).toEqual(testLogs);
    });

    it('handles localStorage parse errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      const logs = ErrorLogger.getLogs();
      expect(logs).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('getLogsByCategory', () => {
    it('filters logs by category', () => {
      const testLogs = [
        { id: '1', category: 'database', message: 'DB error' },
        { id: '2', category: 'network', message: 'Network error' },
        { id: '3', category: 'database', message: 'Another DB error' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const dbLogs = ErrorLogger.getLogsByCategory('database');
      expect(dbLogs).toHaveLength(2);
      expect(dbLogs.every(log => log.category === 'database')).toBe(true);
    });
  });

  describe('getLogsByLevel', () => {
    it('filters logs by level', () => {
      const testLogs = [
        { id: '1', level: 'error', message: 'Error 1' },
        { id: '2', level: 'warning', message: 'Warning 1' },
        { id: '3', level: 'error', message: 'Error 2' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const errorLogs = ErrorLogger.getLogsByLevel('error');
      expect(errorLogs).toHaveLength(2);
      expect(errorLogs.every(log => log.level === 'error')).toBe(true);
    });
  });

  describe('getRecentLogs', () => {
    it('returns last N logs', () => {
      const testLogs = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        message: `Log ${i}`
      }));
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const recentLogs = ErrorLogger.getRecentLogs(5);
      expect(recentLogs).toHaveLength(5);
      expect(recentLogs[0].id).toBe('15'); // Last 5 logs
      expect(recentLogs[4].id).toBe('19');
    });

    it('returns all logs if count is greater than total', () => {
      const testLogs = [
        { id: '1', message: 'Log 1' },
        { id: '2', message: 'Log 2' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const recentLogs = ErrorLogger.getRecentLogs(10);
      expect(recentLogs).toHaveLength(2);
    });
  });

  describe('clearLogs', () => {
    it('removes logs from localStorage', () => {
      ErrorLogger.clearLogs();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-error-logs');
    });

    it('handles localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      ErrorLogger.clearLogs();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('clearOldLogs', () => {
    it('removes logs older than specified days', () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const recentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

      const testLogs = [
        { id: '1', timestamp: oldDate.toISOString(), message: 'Old log' },
        { id: '2', timestamp: recentDate.toISOString(), message: 'Recent log' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      ErrorLogger.clearOldLogs(7); // Clear logs older than 7 days

      const setItemCall = mockLocalStorage.setItem.mock.calls[0];
      const remainingLogs = JSON.parse(setItemCall[1]);
      expect(remainingLogs).toHaveLength(1);
      expect(remainingLogs[0].id).toBe('2');
    });
  });

  describe('exportLogs', () => {
    it('returns logs as JSON string', () => {
      const testLogs = [
        { id: '1', message: 'Test log' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const exported = ErrorLogger.exportLogs();
      expect(exported).toBe(JSON.stringify(testLogs, null, 2));
    });
  });

  describe('getLogStats', () => {
    it('returns correct statistics', () => {
      const testLogs = [
        { id: '1', level: 'error', category: 'database', timestamp: '2023-01-01T00:00:00Z' },
        { id: '2', level: 'error', category: 'network', timestamp: '2023-01-02T00:00:00Z' },
        { id: '3', level: 'warning', category: 'database', timestamp: '2023-01-03T00:00:00Z' },
        { id: '4', level: 'info', category: 'ui', timestamp: '2023-01-04T00:00:00Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const stats = ErrorLogger.getLogStats();

      expect(stats.total).toBe(4);
      expect(stats.byLevel.error).toBe(2);
      expect(stats.byLevel.warning).toBe(1);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byCategory.database).toBe(2);
      expect(stats.byCategory.network).toBe(1);
      expect(stats.byCategory.ui).toBe(1);
      expect(stats.oldestLog).toBe('2023-01-01T00:00:00Z');
      expect(stats.newestLog).toBe('2023-01-04T00:00:00Z');
    });

    it('handles empty logs', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      const stats = ErrorLogger.getLogStats();

      expect(stats.total).toBe(0);
      expect(stats.byLevel.error).toBe(0);
      expect(stats.oldestLog).toBeUndefined();
      expect(stats.newestLog).toBeUndefined();
    });
  });

  describe('log storage management', () => {
    it('keeps only MAX_LOGS entries', () => {
      // Create more logs than the limit
      const existingLogs = Array.from({ length: 55 }, (_, i) => ({
        id: `${i}`,
        message: `Log ${i}`
      }));
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingLogs));

      ErrorLogger.logError('test', 'New error');

      const setItemCall = mockLocalStorage.setItem.mock.calls[0];
      const storedLogs = JSON.parse(setItemCall[1]);
      expect(storedLogs).toHaveLength(50); // MAX_LOGS = 50
    });

    it('handles localStorage storage errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const logId = ErrorLogger.logError('test', 'Test error');

      expect(logId).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith('Could not store error log:', expect.any(Error));
    });
  });

  describe('isAvailable', () => {
    it('returns true when localStorage is available', () => {
      // Temporarily restore real localStorage for this test
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: vi.fn(),
          removeItem: vi.fn()
        }
      });
      
      expect(ErrorLogger.isAvailable()).toBe(true);
      
      // Restore mock
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage
      });
    });

    it('returns false when localStorage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      expect(ErrorLogger.isAvailable()).toBe(false);
    });
  });

  describe('getStorageUsage', () => {
    it('calculates storage usage', () => {
      const testLogs = [
        { id: '1', message: 'Test log with some content' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

      const usage = ErrorLogger.getStorageUsage();

      expect(usage.size).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThan(0);
      expect(usage.percentage).toBeLessThan(100);
    });

    it('handles errors gracefully', () => {
      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn().mockImplementation(() => {
        throw new Error('JSON error');
      });

      const usage = ErrorLogger.getStorageUsage();

      expect(usage.size).toBe(0);
      expect(usage.percentage).toBe(0);
      
      // Restore original
      JSON.stringify = originalStringify;
    });
  });
});

describe('useErrorLogger hook', () => {
  it('provides logging functions', () => {
    const { result } = renderHook(() => useErrorLogger());

    expect(result.current.logError).toBeDefined();
    expect(result.current.logWarning).toBeDefined();
    expect(result.current.logInfo).toBeDefined();
    expect(result.current.getLogs).toBeDefined();
    expect(result.current.clearLogs).toBeDefined();
    expect(result.current.exportLogs).toBeDefined();
    expect(result.current.getStats).toBeDefined();
  });

  it('logs error through hook', () => {
    const { result } = renderHook(() => useErrorLogger());

    act(() => {
      const logId = result.current.logError('test', 'Hook error', new Error('Test'));
      expect(logId).toBeDefined();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('gets logs through hook', () => {
    const testLogs = [{ id: '1', message: 'Test' }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

    const { result } = renderHook(() => useErrorLogger());

    act(() => {
      const logs = result.current.getLogs();
      expect(logs).toEqual(testLogs);
    });
  });
});