/**
 * Error logging service for debugging and monitoring
 * Provides centralized error logging with local storage and console output
 * Requirements: 7.4, 7.5
 */

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
  userAgent: string;
  url: string;
  userId?: string;
}

export class ErrorLogger {
  private static readonly STORAGE_KEY = 'devnotes-error-logs';
  private static readonly MAX_LOGS = 50;

  /**
   * Log an error with context
   */
  static logError(
    category: string,
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): string {
    return this.log('error', category, message, error, context);
  }

  /**
   * Log a warning
   */
  static logWarning(
    category: string,
    message: string,
    context?: Record<string, any>
  ): string {
    return this.log('warning', category, message, undefined, context);
  }

  /**
   * Log an info message
   */
  static logInfo(
    category: string,
    message: string,
    context?: Record<string, any>
  ): string {
    return this.log('info', category, message, undefined, context);
  }

  /**
   * Internal log method
   */
  private static log(
    level: ErrorLog['level'],
    category: string,
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): string {
    const id = this.generateId();
    const timestamp = new Date().toISOString();

    const errorLog: ErrorLog = {
      id,
      timestamp,
      level,
      category,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage
    this.storeLog(errorLog);

    // Log to console
    this.logToConsole(errorLog);

    return id;
  }

  /**
   * Store log in localStorage
   */
  private static storeLog(errorLog: ErrorLog): void {
    try {
      const existingLogs = this.getLogs();
      existingLogs.push(errorLog);

      // Keep only the most recent logs
      const recentLogs = existingLogs.slice(-this.MAX_LOGS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Could not store error log:', error);
    }
  }

  /**
   * Log to console with appropriate level
   */
  private static logToConsole(errorLog: ErrorLog): void {
    const logMessage = `[${errorLog.level.toUpperCase()}] ${errorLog.category}: ${errorLog.message}`;
    
    switch (errorLog.level) {
      case 'error':
        console.error(logMessage, errorLog.error, errorLog.context);
        break;
      case 'warning':
        console.warn(logMessage, errorLog.context);
        break;
      case 'info':
        console.info(logMessage, errorLog.context);
        break;
    }
  }

  /**
   * Get all stored logs
   */
  static getLogs(): ErrorLog[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.warn('Could not retrieve error logs:', error);
      return [];
    }
  }

  /**
   * Get logs by category
   */
  static getLogsByCategory(category: string): ErrorLog[] {
    return this.getLogs().filter(log => log.category === category);
  }

  /**
   * Get logs by level
   */
  static getLogsByLevel(level: ErrorLog['level']): ErrorLog[] {
    return this.getLogs().filter(log => log.level === level);
  }

  /**
   * Get recent logs (last N logs)
   */
  static getRecentLogs(count: number = 10): ErrorLog[] {
    return this.getLogs().slice(-count);
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear error logs:', error);
    }
  }

  /**
   * Clear logs older than specified days
   */
  static clearOldLogs(days: number = 7): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const logs = this.getLogs();
      const recentLogs = logs.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Could not clear old logs:', error);
    }
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get log statistics
   */
  static getLogStats(): {
    total: number;
    byLevel: Record<ErrorLog['level'], number>;
    byCategory: Record<string, number>;
    oldestLog?: string;
    newestLog?: string;
  } {
    const logs = this.getLogs();
    
    const byLevel: Record<ErrorLog['level'], number> = {
      error: 0,
      warning: 0,
      info: 0
    };

    const byCategory: Record<string, number> = {};

    logs.forEach(log => {
      byLevel[log.level]++;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    return {
      total: logs.length,
      byLevel,
      byCategory,
      oldestLog: logs.length > 0 ? logs[0].timestamp : undefined,
      newestLog: logs.length > 0 ? logs[logs.length - 1].timestamp : undefined
    };
  }

  /**
   * Generate unique ID for log entry
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if logging is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__devnotes_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage for logs
   */
  static getStorageUsage(): { size: number; percentage: number } {
    try {
      const logs = JSON.stringify(this.getLogs());
      const size = new Blob([logs]).size;
      
      // Estimate percentage of localStorage used (rough calculation)
      const totalStorage = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const percentage = (size / totalStorage) * 100;

      return { size, percentage };
    } catch (error) {
      return { size: 0, percentage: 0 };
    }
  }
}

/**
 * React hook for error logging
 */
export const useErrorLogger = () => {
  const logError = (category: string, message: string, error?: Error, context?: Record<string, any>) => {
    return ErrorLogger.logError(category, message, error, context);
  };

  const logWarning = (category: string, message: string, context?: Record<string, any>) => {
    return ErrorLogger.logWarning(category, message, context);
  };

  const logInfo = (category: string, message: string, context?: Record<string, any>) => {
    return ErrorLogger.logInfo(category, message, context);
  };

  return {
    logError,
    logWarning,
    logInfo,
    getLogs: ErrorLogger.getLogs,
    clearLogs: ErrorLogger.clearLogs,
    exportLogs: ErrorLogger.exportLogs,
    getStats: ErrorLogger.getLogStats
  };
};