/**
 * Error handling utilities for user guide
 * Requirements: 4.3
 */

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  additionalData?: Record<string, any>;
}

export class UserGuideError extends Error {
  public readonly context: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    context: Partial<ErrorContext>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'UserGuideError';
    this.originalError = originalError;
    this.context = {
      component: context.component || 'Unknown',
      action: context.action || 'Unknown',
      timestamp: context.timestamp || new Date(),
      userAgent: context.userAgent || navigator.userAgent,
      url: context.url || window.location.href,
      additionalData: context.additionalData,
    };
  }
}

export class RetryManager {
  private static retryAttempts = new Map<string, number>();

  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions,
    key?: string
  ): Promise<T> {
    const {
      maxAttempts,
      delay,
      backoffMultiplier = 1.5,
      onRetry
    } = options;

    let lastError: Error | undefined;
    const retryKey = key || fn.toString();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        
        // Reset retry count on success
        if (this.retryAttempts.has(retryKey)) {
          this.retryAttempts.delete(retryKey);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Update retry count
        this.retryAttempts.set(retryKey, attempt);

        if (attempt === maxAttempts) {
          break;
        }

        // Call retry callback
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Wait before retrying with exponential backoff
        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
        await this.sleep(waitTime);
      }
    }

    throw new UserGuideError(
      `Failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
      {
        component: 'RetryManager',
        action: 'withRetry',
        additionalData: {
          maxAttempts,
          finalAttempt: maxAttempts,
          originalError: lastError?.message || 'Unknown error',
        }
      },
      lastError
    );
  }

  /**
   * Get current retry count for a key
   */
  static getRetryCount(key: string): number {
    return this.retryAttempts.get(key) || 0;
  }

  /**
   * Reset retry count for a key
   */
  static resetRetryCount(key: string): void {
    this.retryAttempts.delete(key);
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ErrorLogger {
  private static errors: UserGuideError[] = [];
  private static maxErrors = 50;

  /**
   * Log an error
   */
  static log(error: UserGuideError): void {
    // Add to in-memory store
    this.errors.unshift(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('UserGuide Error:', {
        message: error.message,
        context: error.context,
        originalError: error.originalError,
        stack: error.stack,
      });
    }

    // Store in localStorage for debugging
    this.persistToStorage(error);

    // Send to error tracking service (if available)
    this.sendToTrackingService(error);
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(count = 10): UserGuideError[] {
    return this.errors.slice(0, count);
  }

  /**
   * Clear all errors
   */
  static clearErrors(): void {
    this.errors = [];
    try {
      localStorage.removeItem('userGuideErrors');
    } catch (e) {
      console.warn('Failed to clear errors from localStorage:', e);
    }
  }

  /**
   * Persist error to localStorage
   */
  private static persistToStorage(error: UserGuideError): void {
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem('userGuideErrors') || '[]'
      );

      const errorData = {
        message: error.message,
        context: error.context,
        originalError: error.originalError?.message,
        stack: error.stack,
      };

      existingErrors.unshift(errorData);

      // Keep only recent errors
      if (existingErrors.length > 20) {
        existingErrors.splice(20);
      }

      localStorage.setItem('userGuideErrors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to persist error to localStorage:', e);
    }
  }

  /**
   * Send error to tracking service
   */
  private static sendToTrackingService(error: UserGuideError): void {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    
    // For now, we'll just prepare the data structure
    const errorReport = {
      message: error.message,
      context: error.context,
      originalError: error.originalError?.message,
      stack: error.stack,
      fingerprint: this.generateFingerprint(error),
    };

    // Example: Send to hypothetical error service
    // errorTrackingService.captureException(errorReport);
    
    console.debug('Error report prepared for tracking service:', errorReport);
  }

  /**
   * Generate a fingerprint for error grouping
   */
  private static generateFingerprint(error: UserGuideError): string {
    const key = `${error.context.component}-${error.context.action}-${error.message}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }
}

/**
 * Content loading with error handling
 */
export class SafeContentLoader {
  private static cache = new Map<string, any>();
  private static loadingPromises = new Map<string, Promise<any>>();

  /**
   * Load content with error handling and caching
   */
  static async loadContent<T>(
    key: string,
    loader: () => Promise<T>,
    options: {
      useCache?: boolean;
      timeout?: number;
      retryOptions?: RetryOptions;
    } = {}
  ): Promise<T> {
    const {
      useCache = true,
      timeout = 10000,
      retryOptions = {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 1.5,
      }
    } = options;

    // Return cached content if available
    if (useCache && this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Create loading promise
    const loadingPromise = this.loadWithTimeout(
      () => RetryManager.withRetry(loader, retryOptions, key),
      timeout,
      key
    );

    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      
      // Cache successful result
      if (useCache) {
        this.cache.set(key, result);
      }
      
      return result;
    } catch (error) {
      // Log error
      ErrorLogger.log(new UserGuideError(
        `Failed to load content: ${key}`,
        {
          component: 'SafeContentLoader',
          action: 'loadContent',
          additionalData: { key, timeout, retryOptions }
        },
        error as Error
      ));
      
      throw error;
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(key);
    }
  }

  /**
   * Load with timeout
   */
  private static async loadWithTimeout<T>(
    loader: () => Promise<T>,
    timeout: number,
    key: string
  ): Promise<T> {
    return Promise.race([
      loader(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new UserGuideError(
            `Content loading timed out after ${timeout}ms`,
            {
              component: 'SafeContentLoader',
              action: 'loadWithTimeout',
              additionalData: { key, timeout }
            }
          ));
        }, timeout);
      })
    ]);
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Search error handling
 */
export class SafeSearchManager {
  private static searchCache = new Map<string, any>();
  private static maxCacheSize = 100;

  /**
   * Perform search with error handling
   */
  static async performSearch<T>(
    query: string,
    searchFunction: (query: string) => Promise<T>,
    options: {
      useCache?: boolean;
      timeout?: number;
      retryOptions?: RetryOptions;
    } = {}
  ): Promise<T> {
    const {
      useCache = true,
      timeout = 5000,
      retryOptions = {
        maxAttempts: 2,
        delay: 500,
      }
    } = options;

    const cacheKey = `search:${query}`;

    // Return cached results if available
    if (useCache && this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    try {
      const result = await SafeContentLoader.loadContent(
        cacheKey,
        () => searchFunction(query),
        { useCache: false, timeout, retryOptions }
      );

      // Cache search results
      if (useCache) {
        this.cacheSearchResult(cacheKey, result);
      }

      return result;
    } catch (error) {
      ErrorLogger.log(new UserGuideError(
        `Search failed for query: ${query}`,
        {
          component: 'SafeSearchManager',
          action: 'performSearch',
          additionalData: { query, timeout, retryOptions }
        },
        error as Error
      ));

      // Return empty results on search failure
      return [] as unknown as T;
    }
  }

  /**
   * Cache search result with size management
   */
  private static cacheSearchResult(key: string, result: any): void {
    // Remove oldest entries if cache is full
    if (this.searchCache.size >= this.maxCacheSize) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey !== undefined) {
        this.searchCache.delete(firstKey);
      }
    }

    this.searchCache.set(key, result);
  }

  /**
   * Clear search cache
   */
  static clearSearchCache(): void {
    this.searchCache.clear();
  }
}