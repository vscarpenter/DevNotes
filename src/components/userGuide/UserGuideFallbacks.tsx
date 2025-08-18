/**
 * UserGuideFallbacks - Fallback components for various error states
 * Requirements: 4.3
 */

import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  FileX, 
  Search, 
  Clock,
  Home,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';

interface FallbackProps {
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

// Content loading fallback
export const ContentLoadingFallback: React.FC<FallbackProps> = ({
  onRetry,
  onGoHome,
  className = ''
}) => (
  <div className={`flex items-center justify-center h-full p-6 ${className}`}>
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        <FileX className="w-12 h-12 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Content Unavailable
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The requested content could not be loaded. This might be due to a temporary issue.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        
        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Welcome
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Search error fallback
export const SearchErrorFallback: React.FC<FallbackProps & { query?: string }> = ({
  onRetry,
  query,
  className = ''
}) => (
  <div className={`flex items-center justify-center p-6 ${className}`}>
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        <Search className="w-8 h-8 mx-auto" />
      </div>
      
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
        Search Temporarily Unavailable
      </h4>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {query 
          ? `Unable to search for "${query}". Please try again.`
          : 'Search functionality is currently unavailable.'
        }
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Search
        </Button>
      )}
    </div>
  </div>
);

// Network error fallback
export const NetworkErrorFallback: React.FC<FallbackProps> = ({
  onRetry,
  className = ''
}) => (
  <div className={`flex items-center justify-center h-full p-6 ${className}`}>
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        <Wifi className="w-12 h-12 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Connection Issue
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Unable to load content. Please check your connection and try again.
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      )}
    </div>
  </div>
);

// Loading skeleton for content
export const ContentLoadingSkeleton: React.FC<{ className?: string }> = ({
  className = ''
}) => (
  <div className={`animate-pulse ${className}`}>
    {/* Header skeleton */}
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>

    {/* Content skeleton */}
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
      
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-8"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      
      {/* Code block skeleton */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 mt-6">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Navigation loading skeleton
export const NavigationLoadingSkeleton: React.FC<{ className?: string }> = ({
  className = ''
}) => (
  <div className={`animate-pulse p-4 ${className}`}>
    <div className="space-y-3">
      {/* Section headers */}
      {[1, 2, 3, 4].map((section) => (
        <div key={section}>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="ml-4 space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Empty state fallback
export const EmptyStateFallback: React.FC<{
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ title, description, action, className = '' }) => (
  <div className={`flex items-center justify-center h-full p-6 ${className}`}>
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        <BookOpen className="w-12 h-12 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  </div>
);

// Timeout error fallback
export const TimeoutErrorFallback: React.FC<FallbackProps> = ({
  onRetry,
  className = ''
}) => (
  <div className={`flex items-center justify-center h-full p-6 ${className}`}>
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        <Clock className="w-12 h-12 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Request Timed Out
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The content is taking longer than expected to load. This might be due to a slow connection.
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  </div>
);

// Generic error fallback with customizable content
export const GenericErrorFallback: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  className?: string;
}> = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  icon,
  actions = [],
  className = ''
}) => (
  <div className={`flex items-center justify-center h-full p-6 ${className}`}>
    <div className="text-center max-w-md">
      <div className="text-gray-400 mb-4">
        {icon || <AlertTriangle className="w-12 h-12 mx-auto" />}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  </div>
);