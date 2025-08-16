/**
 * Global error handler hook
 * Integrates error boundary, toast notifications, and error logging
 * Requirements: 7.4, 7.5
 */

import { useEffect } from 'react';
import { useErrorToast } from '../components/ui/toast';
import { ErrorLogger } from '../lib/utils/errorLogger';
import { DatabaseErrorHandler } from '../lib/db/DatabaseErrorHandler';
import { useUIStore } from '../stores/uiStore';

export const useGlobalErrorHandler = () => {
  const showErrorToast = useErrorToast();
  const setError = useUIStore(state => state.setError);

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      ErrorLogger.logError(
        'unhandled-promise',
        'Unhandled promise rejection',
        error,
        { url: window.location.href }
      );

      // Show user-friendly error message
      showErrorToast(
        'Something went wrong',
        'An unexpected error occurred. Please try again.',
        {
          label: 'Report Issue',
          onClick: () => {
            // Could open a bug report modal or copy error details
            navigator.clipboard?.writeText(ErrorLogger.exportLogs());
            showErrorToast('Error details copied to clipboard');
          }
        }
      );

      // Prevent default browser error handling
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      
      ErrorLogger.logError(
        'global-error',
        'Global JavaScript error',
        error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          url: window.location.href
        }
      );

      // Show user-friendly error message for critical errors
      if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
        showErrorToast(
          'Loading Error',
          'Failed to load application resources. Please refresh the page.',
          {
            label: 'Refresh',
            onClick: () => window.location.reload()
          }
        );
      } else {
        showErrorToast(
          'Application Error',
          'An unexpected error occurred. Your data is safe.',
          {
            label: 'Report Issue',
            onClick: () => {
              navigator.clipboard?.writeText(ErrorLogger.exportLogs());
            }
          }
        );
      }
    };

    // Handle database errors
    const handleDatabaseError = (event: CustomEvent) => {
      const { message } = event.detail;
      
      ErrorLogger.logError(
        'database-error',
        'Database operation failed',
        undefined,
        { message, timestamp: event.detail.timestamp }
      );

      // Show appropriate toast based on error type
      if (message.includes('quota exceeded')) {
        showErrorToast(
          'Storage Full',
          'Your browser storage is full. Please export your data or delete some notes.',
          {
            label: 'Export Data',
            onClick: () => {
              // This would trigger the export modal
              useUIStore.getState().openModal('export');
            }
          }
        );
      } else if (message.includes('version conflict')) {
        showErrorToast(
          'Update Required',
          'The application needs to reload to apply updates.',
          {
            label: 'Reload Now',
            onClick: () => window.location.reload()
          }
        );
      } else {
        showErrorToast(
          'Database Error',
          'Failed to save your changes. Please try again.',
          {
            label: 'Retry',
            onClick: () => {
              // This could trigger a retry mechanism
              window.location.reload();
            }
          }
        );
      }
    };

    // Handle network errors
    const handleNetworkError = () => {
      if (!navigator.onLine) {
        ErrorLogger.logWarning(
          'network',
          'Application is offline',
          { timestamp: new Date().toISOString() }
        );

        showErrorToast(
          'Offline Mode',
          'You are currently offline. Your changes will be saved locally.',
          {
            label: 'Dismiss',
            onClick: () => {}
          }
        );
      }
    };

    // Handle online/offline status
    const handleOnline = () => {
      ErrorLogger.logInfo(
        'network',
        'Application is back online',
        { timestamp: new Date().toISOString() }
      );
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('database-error', handleDatabaseError as EventListener);
    window.addEventListener('offline', handleNetworkError);
    window.addEventListener('online', handleOnline);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('database-error', handleDatabaseError as EventListener);
      window.removeEventListener('offline', handleNetworkError);
      window.removeEventListener('online', handleOnline);
    };
  }, [showErrorToast, setError]);

  // Return utility functions for manual error handling
  return {
    handleError: (error: Error, category: string = 'manual', context?: Record<string, any>) => {
      ErrorLogger.logError(category, error.message, error, context);
      
      const userMessage = DatabaseErrorHandler.getUserFriendlyMessage(error, category);
      showErrorToast('Error', userMessage);
      
      setError(userMessage);
    },

    handleWarning: (message: string, category: string = 'manual', context?: Record<string, any>) => {
      ErrorLogger.logWarning(category, message, context);
    },

    clearError: () => {
      setError(null);
    },

    isOnline: navigator.onLine,
    
    getErrorStats: ErrorLogger.getLogStats,
    
    exportErrorLogs: () => {
      const logs = ErrorLogger.exportLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devnotes-error-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
};