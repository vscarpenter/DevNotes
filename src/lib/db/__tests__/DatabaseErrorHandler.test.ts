/**
 * Unit tests for DatabaseErrorHandler
 * Tests error handling and user feedback functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseErrorHandler } from '../DatabaseErrorHandler';

// Mock browser APIs
const mockNavigatorStorage = {
  estimate: vi.fn()
};

const mockAlert = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleInfo = vi.fn();
const mockConsoleWarn = vi.fn();

// Mock window.location.reload
const mockReload = vi.fn();

describe('DatabaseErrorHandler', () => {
  beforeEach(() => {
    // Mock navigator.storage
    Object.defineProperty(navigator, 'storage', {
      value: mockNavigatorStorage,
      writable: true
    });

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
    vi.spyOn(console, 'info').mockImplementation(mockConsoleInfo);
    vi.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

    // Mock window.alert
    vi.stubGlobal('alert', mockAlert);

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('handleDatabaseError', () => {
    it('should handle QuotaExceededError', async () => {
      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      mockNavigatorStorage.estimate.mockResolvedValue({
        usage: 50 * 1024 * 1024, // 50MB
        quota: 100 * 1024 * 1024  // 100MB
      });

      await DatabaseErrorHandler.handleDatabaseError(error, 'createNote');

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Database operation failed: createNote',
        error
      );
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Storage quota exceeded')
      );
      expect(mockConsoleInfo).toHaveBeenCalledWith(
        'Cleanup suggestions:',
        expect.any(Array)
      );
    });

    it('should handle VersionError', async () => {
      const error = new Error('Version conflict');
      error.name = 'VersionError';

      await DatabaseErrorHandler.handleDatabaseError(error, 'updateNote');

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Database operation failed: updateNote',
        error
      );
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Database version conflict')
      );

      // Fast-forward time to trigger reload
      vi.advanceTimersByTime(3000);
      expect(mockReload).toHaveBeenCalled();
    });

    it('should handle NotFoundError', async () => {
      const error = new Error('Item not found');
      error.name = 'NotFoundError';

      await DatabaseErrorHandler.handleDatabaseError(error, 'deleteNote');

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Database operation failed: deleteNote',
        error
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Database Error:',
        'Item not found during deleteNote'
      );
      expect(mockAlert).not.toHaveBeenCalled(); // NotFoundError doesn't trigger alert
    });

    it('should handle generic errors', async () => {
      const error = new Error('Generic database error');

      await DatabaseErrorHandler.handleDatabaseError(error, 'genericOperation');

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Database operation failed: genericOperation',
        error
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Database Error:',
        'Operation failed: genericOperation. Generic database error'
      );
    });
  });

  describe('getStorageUsage', () => {
    it('should return storage usage when navigator.storage is available', async () => {
      mockNavigatorStorage.estimate.mockResolvedValue({
        usage: 25 * 1024 * 1024, // 25MB
        quota: 100 * 1024 * 1024  // 100MB
      });

      // Access private method through error handling
      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      await DatabaseErrorHandler.handleDatabaseError(error, 'test');

      expect(mockNavigatorStorage.estimate).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Current usage: 25MB of 100MB')
      );
    });

    it('should handle storage estimation errors', async () => {
      mockNavigatorStorage.estimate.mockRejectedValue(new Error('Estimation failed'));

      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      await DatabaseErrorHandler.handleDatabaseError(error, 'test');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Could not estimate storage usage:',
        expect.any(Error)
      );
    });

    it('should handle missing navigator.storage', async () => {
      // Remove navigator.storage
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        writable: true
      });

      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      await DatabaseErrorHandler.handleDatabaseError(error, 'test');

      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Current usage: 0MB of 0MB')
      );
    });
  });

  describe('isRecoverableError', () => {
    it('should identify recoverable errors', () => {
      const recoverableErrors = [
        { name: 'NotFoundError', message: 'Not found' },
        { name: 'ConstraintError', message: 'Constraint violation' },
        { name: 'DataError', message: 'Data error' }
      ];

      recoverableErrors.forEach(errorData => {
        const error = new Error(errorData.message);
        error.name = errorData.name;
        expect(DatabaseErrorHandler.isRecoverableError(error)).toBe(true);
      });
    });

    it('should identify non-recoverable errors', () => {
      const nonRecoverableErrors = [
        { name: 'QuotaExceededError', message: 'Quota exceeded' },
        { name: 'VersionError', message: 'Version error' },
        { name: 'UnknownError', message: 'Unknown error' }
      ];

      nonRecoverableErrors.forEach(errorData => {
        const error = new Error(errorData.message);
        error.name = errorData.name;
        expect(DatabaseErrorHandler.isRecoverableError(error)).toBe(false);
      });
    });
  });

  describe('requiresUserAction', () => {
    it('should identify errors requiring user action', () => {
      const criticalErrors = [
        { name: 'QuotaExceededError', message: 'Quota exceeded' },
        { name: 'VersionError', message: 'Version error' }
      ];

      criticalErrors.forEach(errorData => {
        const error = new Error(errorData.message);
        error.name = errorData.name;
        expect(DatabaseErrorHandler.requiresUserAction(error)).toBe(true);
      });
    });

    it('should identify errors not requiring user action', () => {
      const nonCriticalErrors = [
        { name: 'NotFoundError', message: 'Not found' },
        { name: 'DataError', message: 'Data error' },
        { name: 'UnknownError', message: 'Unknown error' }
      ];

      nonCriticalErrors.forEach(errorData => {
        const error = new Error(errorData.message);
        error.name = errorData.name;
        expect(DatabaseErrorHandler.requiresUserAction(error)).toBe(false);
      });
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly messages for known errors', () => {
      const testCases = [
        {
          error: { name: 'QuotaExceededError', message: 'Quota exceeded' },
          expected: 'Storage space is full. Please export your data or delete some notes.'
        },
        {
          error: { name: 'VersionError', message: 'Version error' },
          expected: 'Database needs to be updated. The page will reload automatically.'
        },
        {
          error: { name: 'NotFoundError', message: 'Not found' },
          expected: 'The requested item could not be found.'
        },
        {
          error: { name: 'ConstraintError', message: 'Constraint violation' },
          expected: 'Invalid data provided. Please check your input and try again.'
        },
        {
          error: { name: 'DataError', message: 'Data error' },
          expected: 'Data format error. Please check your input.'
        },
        {
          error: { name: 'AbortError', message: 'Aborted' },
          expected: 'Operation was cancelled.'
        }
      ];

      testCases.forEach(({ error, expected }) => {
        const errorObj = new Error(error.message);
        errorObj.name = error.name;
        const message = DatabaseErrorHandler.getUserFriendlyMessage(errorObj, 'testOperation');
        expect(message).toBe(expected);
      });
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown error');
      error.name = 'UnknownError';
      
      const message = DatabaseErrorHandler.getUserFriendlyMessage(error, 'testOperation');
      expect(message).toBe('An error occurred during testOperation. Please try again.');
    });
  });

  describe('suggestCleanupStrategies', () => {
    it('should log cleanup suggestions', async () => {
      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';

      mockNavigatorStorage.estimate.mockResolvedValue({
        usage: 50 * 1024 * 1024,
        quota: 100 * 1024 * 1024
      });

      await DatabaseErrorHandler.handleDatabaseError(error, 'test');

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        'Cleanup suggestions:',
        expect.arrayContaining([
          'Export and delete old notes',
          'Remove unused folders',
          'Clear browser cache',
          'Use the bulk export feature to backup data'
        ])
      );
    });
  });
});