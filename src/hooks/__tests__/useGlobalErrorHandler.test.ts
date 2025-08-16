/**
 * Tests for useGlobalErrorHandler hook
 * Requirements: 7.4, 7.5
 */

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useGlobalErrorHandler } from '../useGlobalErrorHandler';

// Mock dependencies
vi.mock('../../components/ui/toast', () => ({
  useErrorToast: () => vi.fn()
}));

vi.mock('../../lib/utils/errorLogger', () => ({
  ErrorLogger: {
    logError: vi.fn(),
    logWarning: vi.fn(),
    logInfo: vi.fn(),
    exportLogs: vi.fn(() => 'mock-logs'),
    getLogStats: vi.fn(() => ({ total: 0 }))
  }
}));

vi.mock('../../stores/uiStore', () => ({
  useUIStore: vi.fn(() => vi.fn())
}));

describe('useGlobalErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
  });

  it('sets up global error handlers on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    renderHook(() => useGlobalErrorHandler());

    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('database-error', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
  });

  it('removes event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useGlobalErrorHandler());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('database-error', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
  });

  it('provides utility functions', () => {
    const { result } = renderHook(() => useGlobalErrorHandler());

    expect(result.current.handleError).toBeDefined();
    expect(result.current.handleWarning).toBeDefined();
    expect(result.current.clearError).toBeDefined();
    expect(result.current.isOnline).toBeDefined();
    expect(result.current.getErrorStats).toBeDefined();
    expect(result.current.exportErrorLogs).toBeDefined();
  });


});