/**
 * React Error Boundary component for graceful error recovery
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 * Requirements: 7.4, 7.5
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    this.logError(error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store error in localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('devnotes-error-logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 error logs
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('devnotes-error-logs', JSON.stringify(recentLogs));
    } catch (storageError) {
      console.warn('Could not store error log:', storageError);
    }

    // Also log to console
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear any problematic state and reload
    try {
      localStorage.removeItem('devnotes-app-store');
      localStorage.removeItem('devnotes-ui-store');
      localStorage.removeItem('devnotes-note-store');
      localStorage.removeItem('devnotes-folder-store');
      localStorage.removeItem('devnotes-search-store');
    } catch (error) {
      console.warn('Could not clear localStorage:', error);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h1 className="text-lg font-semibold text-foreground">
                Something went wrong
              </h1>
            </div>
            
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Your data is safe and stored locally.
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-3 bg-muted rounded border">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-muted-foreground">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.name}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleReload} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome} 
                variant="outline" 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Reset Application
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to access error boundary functionality
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    // Log error
    console.error('Application error:', error, errorInfo);
    
    // Store error for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const existingLogs = JSON.parse(localStorage.getItem('devnotes-error-logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 error logs
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('devnotes-error-logs', JSON.stringify(recentLogs));
    } catch (storageError) {
      console.warn('Could not store error log:', storageError);
    }
  };

  const clearErrorLogs = () => {
    try {
      localStorage.removeItem('devnotes-error-logs');
    } catch (error) {
      console.warn('Could not clear error logs:', error);
    }
  };

  const getErrorLogs = () => {
    try {
      return JSON.parse(localStorage.getItem('devnotes-error-logs') || '[]');
    } catch (error) {
      console.warn('Could not retrieve error logs:', error);
      return [];
    }
  };

  return {
    handleError,
    clearErrorLogs,
    getErrorLogs
  };
};