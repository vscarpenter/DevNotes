/**
 * Database error handling utilities
 * Provides centralized error handling for database operations
 * Requirements: 7.4, 7.5
 */

export class DatabaseErrorHandler {
  /**
   * Handle database errors with appropriate user feedback
   */
  static async handleDatabaseError(error: Error, operation: string): Promise<void> {
    console.error(`Database operation failed: ${operation}`, error);
    
    if (error.name === 'QuotaExceededError') {
      await this.handleStorageQuotaExceeded();
    } else if (error.name === 'VersionError') {
      await this.handleVersionConflict();
    } else if (error.name === 'NotFoundError') {
      this.showErrorNotification(`Item not found during ${operation}`);
    } else {
      this.showErrorNotification(`Operation failed: ${operation}. ${error.message}`);
    }
  }

  /**
   * Handle storage quota exceeded errors
   */
  private static async handleStorageQuotaExceeded(): Promise<void> {
    // Calculate current storage usage
    const usage = await this.getStorageUsage();
    
    const message = `Storage quota exceeded. Current usage: ${usage.used}MB of ${usage.quota}MB. Please export your data or delete some notes to free up space.`;
    
    this.showErrorNotification(message);
    
    // Optionally trigger cleanup strategies
    await this.suggestCleanupStrategies();
  }

  /**
   * Handle database version conflicts
   */
  private static async handleVersionConflict(): Promise<void> {
    const message = 'Database version conflict detected. The application will reload to resolve this issue.';
    
    this.showErrorNotification(message);
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  /**
   * Get current storage usage information
   */
  private static async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && navigator.storage && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: Math.round((estimate.usage || 0) / 1024 / 1024), // Convert to MB
          quota: Math.round((estimate.quota || 0) / 1024 / 1024) // Convert to MB
        };
      } catch (error) {
        console.warn('Could not estimate storage usage:', error);
      }
    }
    
    return { used: 0, quota: 0 };
  }

  /**
   * Suggest cleanup strategies when storage is full
   */
  private static async suggestCleanupStrategies(): Promise<void> {
    // This would integrate with the UI to show cleanup suggestions
    // For now, just log the suggestions
    console.info('Cleanup suggestions:', [
      'Export and delete old notes',
      'Remove unused folders',
      'Clear browser cache',
      'Use the bulk export feature to backup data'
    ]);
  }

  /**
   * Show error notification to user
   * This would integrate with the application's notification system
   */
  private static showErrorNotification(message: string): void {
    // For now, use console.error and alert
    // In a real app, this would integrate with a toast/notification system
    console.error('Database Error:', message);
    
    // Only show alert for critical errors
    if (message.includes('quota exceeded') || message.includes('version conflict')) {
      alert(message);
    }
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverableError(error: Error): boolean {
    const recoverableErrors = [
      'NotFoundError',
      'ConstraintError',
      'DataError'
    ];
    
    return recoverableErrors.includes(error.name);
  }

  /**
   * Check if error requires immediate user action
   */
  static requiresUserAction(error: Error): boolean {
    const criticalErrors = [
      'QuotaExceededError',
      'VersionError'
    ];
    
    return criticalErrors.includes(error.name);
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: Error, operation: string): string {
    switch (error.name) {
      case 'QuotaExceededError':
        return 'Storage space is full. Please export your data or delete some notes.';
      
      case 'VersionError':
        return 'Database needs to be updated. The page will reload automatically.';
      
      case 'NotFoundError':
        return 'The requested item could not be found.';
      
      case 'ConstraintError':
        return 'Invalid data provided. Please check your input and try again.';
      
      case 'DataError':
        return 'Data format error. Please check your input.';
      
      case 'AbortError':
        return 'Operation was cancelled.';
      
      default:
        return `An error occurred during ${operation}. Please try again.`;
    }
  }
}