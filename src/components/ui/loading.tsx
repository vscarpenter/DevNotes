/**
 * Loading components for progress indicators and loading states
 * Provides consistent loading UI across the application
 * Requirements: 7.4, 7.5
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-200">
          <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 delay-100">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground animate-in fade-in-0 duration-300 delay-200">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText,
  className = '',
  disabled = false,
  onClick
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
};

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  label
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  lines = 1
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-muted rounded h-4 ${index > 0 ? 'mt-2' : ''} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-muted rounded-full h-8 w-8" />
          <div className="flex-1">
            <div className="bg-muted rounded h-4 w-3/4 mb-2" />
            <div className="bg-muted rounded h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-muted rounded h-3 w-full" />
          <div className="bg-muted rounded h-3 w-5/6" />
          <div className="bg-muted rounded h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  retryAction?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  retryAction
}) => {
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-destructive mb-2">Error</div>
        <p className="text-muted-foreground mb-4">{error}</p>
        {retryAction && (
          <button
            onClick={retryAction}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};