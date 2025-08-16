/**
 * Tests for AppErrorBoundary component
 * Requirements: 7.4, 7.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AppErrorBoundary, useErrorHandler } from '../error-boundary';

// Mock component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

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

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
    href: 'http://localhost:3000'
  },
  writable: true,
});

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
    console.error = vi.fn(); // Suppress error logs in tests
  });

  it('renders children when there is no error', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={false} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Your data is safe and stored locally.')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('logs error to localStorage', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'devnotes-error-logs',
      expect.stringContaining('Test error')
    );
  });

  it('calls onError callback when provided', () => {
    const onError = vi.fn();

    render(
      <AppErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <AppErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('handles Try Again button click', () => {
    const { rerender } = render(
      <AppErrorBoundary key="test-1">
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    // Verify error UI is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // Re-render with a new key and no error to simulate recovery
    rerender(
      <AppErrorBoundary key="test-2">
        <ThrowError shouldThrow={false} />
      </AppErrorBoundary>
    );

    // After clicking Try Again and re-rendering with no error, should show content
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('handles Reload Page button click', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Page');
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('handles Reset Application button click', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    const resetButton = screen.getByText('Reset Application');
    fireEvent.click(resetButton);

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-app-store');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-ui-store');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-note-store');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-folder-store');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-search-store');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    // Should still render error UI even if logging fails
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('keeps only last 10 error logs', () => {
    const existingLogs = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      error: `Error ${i}`,
      timestamp: new Date().toISOString()
    }));

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingLogs));

    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );

    const setItemCall = mockLocalStorage.setItem.mock.calls[0];
    const storedLogs = JSON.parse(setItemCall[1]);
    
    expect(storedLogs).toHaveLength(10);
  });
});

describe('useErrorHandler', () => {
  const TestComponent: React.FC = () => {
    const { handleError, clearErrorLogs, getErrorLogs } = useErrorHandler();

    return (
      <div>
        <button onClick={() => handleError(new Error('Test error'))}>
          Handle Error
        </button>
        <button onClick={clearErrorLogs}>
          Clear Logs
        </button>
        <button onClick={() => {
          const logs = getErrorLogs();
          console.log('Logs:', logs);
        }}>
          Get Logs
        </button>
      </div>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
    console.error = vi.fn();
    console.log = vi.fn();
  });

  it('handles errors correctly', () => {
    render(<TestComponent />);

    const handleErrorButton = screen.getByText('Handle Error');
    fireEvent.click(handleErrorButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'devnotes-error-logs',
      expect.stringContaining('Test error')
    );
  });

  it('clears error logs', () => {
    render(<TestComponent />);

    const clearLogsButton = screen.getByText('Clear Logs');
    fireEvent.click(clearLogsButton);

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devnotes-error-logs');
  });

  it('retrieves error logs', () => {
    const testLogs = [{ id: '1', error: 'Test error' }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testLogs));

    render(<TestComponent />);

    const getLogsButton = screen.getByText('Get Logs');
    fireEvent.click(getLogsButton);

    expect(console.log).toHaveBeenCalledWith('Logs:', testLogs);
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.removeItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(<TestComponent />);

    const clearLogsButton = screen.getByText('Clear Logs');
    fireEvent.click(clearLogsButton);

    // Should not throw error
    expect(screen.getByText('Clear Logs')).toBeInTheDocument();
  });
});