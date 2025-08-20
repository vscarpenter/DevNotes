/**
 * UserGuideModal - Main modal container for the user guide interface
 * Requirements: 1.1, 3.1, 3.3, 6.2
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { X, Share2, Check } from 'lucide-react';
import { useUserGuideStore } from '../../stores/userGuideStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/button';
import { UserGuideNavigation } from './UserGuideNavigation';
import { UserGuideContent } from './UserGuideContent';
import { UserGuideSearch } from './UserGuideSearch';
import { copyGuideLink, getSectionTitle } from '../../lib/userGuide/deepLinking';
import { LazyContentLoader, MemoryManager } from '../../lib/userGuide/performanceOptimizations';
import { UserGuideErrorBoundary } from './UserGuideErrorBoundary';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentSection, navigateToSection } = useUserGuideStore();
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const memoryCleanupRef = useRef<NodeJS.Timeout | null>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // Navigate to previous section (implementation will be added with navigation component)
        break;
      case 'ArrowRight':
        event.preventDefault();
        // Navigate to next section (implementation will be added with navigation component)
        break;
      default:
        break;
    }
  }, [isOpen, onClose]);

  // Set up keyboard event listeners and memory management
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Schedule more aggressive memory cleanup to prevent browser crashes
      memoryCleanupRef.current = setInterval(() => {
        try {
          // Check if memory usage is high before aggressive cleanup
          if (MemoryManager.isMemoryUsageHigh()) {
            console.warn('High memory usage detected in UserGuideModal, performing aggressive cleanup');
            // Cancel any pending content loading
            LazyContentLoader.cancelLoading();
            // Clear all caches
            MemoryManager.clearAllCaches();
            // Force garbage collection if browser supports it
            if (window.gc) {
              try {
                // @ts-ignore - gc is not in the standard TypeScript types
                window.gc();
              } catch (gcError) {
                // Ignore errors if gc is not available
              }
            }
          } else {
            // Regular cleanup
            MemoryManager.performCacheCleanup();
            console.log('Performed scheduled memory cleanup');
          }
        } catch (error) {
          console.error('Error during scheduled memory cleanup:', error);
        }
      }, 15000); // More frequent cleanup (15 seconds)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        
        // Clean up interval
        if (memoryCleanupRef.current) {
          clearInterval(memoryCleanupRef.current);
          memoryCleanupRef.current = null;
        }
        
        // Cancel any pending content loading and perform thorough cleanup
        try {
          LazyContentLoader.cancelLoading();
          MemoryManager.clearAllCaches();
          // Clear any large objects from memory
          if (modalRef.current) {
            // Remove references to large DOM elements
            const contentElements = modalRef.current.querySelectorAll('.prose');
            contentElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.innerHTML = '';
              }
            });
          }
        } catch (error) {
          console.error('Error cleaning up resources:', error);
        }
      };
    }
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle share link
  const handleShareLink = useCallback(async () => {
    const success = await copyGuideLink(currentSection, getSectionTitle(currentSection));
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [currentSection]);

  // Focus management and focus trap
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      const previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Focus the modal container for keyboard navigation
      const modalElement = document.getElementById('user-guide-modal');
      if (modalElement) {
        modalElement.focus();
      }

      // Focus trap implementation
      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const focusableElements = modalElement?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        // Restore focus to previously focused element when modal closes
        if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
          previouslyFocusedElement.focus();
        }
      };
    }
  }, [isOpen]);

  // Error handler for the error boundary
  const handleError = useCallback((error: Error) => {
    console.error('User guide encountered an error:', error);
    setHasError(true);
    
    // Clean up resources on error
    if (memoryCleanupRef.current) {
      clearInterval(memoryCleanupRef.current);
      memoryCleanupRef.current = null;
    }
    
    try {
      // Cancel any pending content loading
      LazyContentLoader.cancelLoading();
      
      // Clear all caches
      MemoryManager.clearAllCaches();
      
      // Clear any large objects from memory
      if (modalRef.current) {
        // Remove references to large DOM elements
        const contentElements = modalRef.current.querySelectorAll('.prose');
        contentElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.innerHTML = '';
          }
        });
      }
      
      // Restart memory management with more conservative settings
      memoryCleanupRef.current = setInterval(() => {
        try {
          // More aggressive cleanup after an error
          LazyContentLoader.clearCache();
          MemoryManager.clearAllCaches();
        } catch (intervalError) {
          console.error('Error in post-error cleanup interval:', intervalError);
        }
      }, 5000); // More frequent cleanup (5 seconds) after error
    } catch (cleanupError) {
      console.error('Error cleaning up resources after error:', cleanupError);
    }
    
    // Log error to localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        section: currentSection
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('userGuideErrors') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      
      localStorage.setItem('userGuideErrors', JSON.stringify(existingLogs));
    } catch (logError) {
      console.error('Failed to log error to localStorage:', logError);
    }
  }, [currentSection]);
  
  // Reset error state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setHasError(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-guide-title"
      aria-describedby="user-guide-description"
      aria-live="polite"
    >
      <div
        id="user-guide-modal"
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden focus:outline-none"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1
              id="user-guide-title"
              className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"
            >
              DevNotes User Guide
            </h1>
            <p
              id="user-guide-description"
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
              Learn how to use DevNotes effectively
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLink}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Share link to current section"
              title="Copy link to this section"
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close user guide"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex h-[calc(90vh-80px)] sm:h-[calc(90vh-96px)]">
          {/* Navigation Sidebar - Hidden on mobile, shown on larger screens */}
          <aside 
            className="hidden md:block w-64 lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
            aria-label="User guide navigation sidebar"
          >
            <UserGuideNavigation />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden" role="main">
            {/* Search Bar - Mobile responsive */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <UserGuideSearch />
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-hidden p-4 sm:p-6">
              <div className="max-w-4xl mx-auto h-full">
                {hasError ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
                      Something went wrong
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      We encountered an error loading the user guide content. This could be due to a memory issue or corrupted content.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={() => {
                          // Perform thorough cleanup
                          try {
                            // Cancel any pending content loading
                            LazyContentLoader.cancelLoading();
                            
                            // Clear all caches
                            LazyContentLoader.clearCache();
                            MemoryManager.clearAllCaches();
                            
                            // Clear any large objects from memory
                            if (modalRef.current) {
                              const contentElements = modalRef.current.querySelectorAll('.prose');
                              contentElements.forEach(el => {
                                if (el instanceof HTMLElement) {
                                  el.innerHTML = '';
                                }
                              });
                            }
                            
                            // Reset error state
                            setHasError(false);
                            
                            // Force garbage collection if browser supports it
                            if (window.gc) {
                              try {
                                // @ts-ignore - gc is not in the standard TypeScript types
                                window.gc();
                              } catch (gcError) {
                                // Ignore errors if gc is not available
                              }
                            }
                          } catch (error) {
                            console.error('Error during recovery attempt:', error);
                          }
                        }}
                        variant="outline"
                        className="mb-2 sm:mb-0"
                      >
                        Try Again
                      </Button>
                      <Button 
                        onClick={() => {
                          // Navigate to welcome section before closing to reset state
                          try {
                            // Clear caches first
                            LazyContentLoader.clearCache();
                            MemoryManager.clearAllCaches();
                            
                            // Navigate to welcome section
                            navigateToSection('welcome');
                            
                            // Reset error state
                            setHasError(false);
                          } catch (error) {
                            console.error('Error navigating to welcome section:', error);
                            // If navigation fails, just close
                            onClose();
                          }
                        }}
                        variant="secondary"
                        className="mb-2 sm:mb-0"
                      >
                        Go to Welcome
                      </Button>
                      <Button 
                        onClick={onClose}
                        variant="ghost"
                      >
                        Close Guide
                      </Button>
                    </div>
                  </div>
                ) : (
                  <UserGuideErrorBoundary onError={handleError}>
                    <UserGuideContent className="h-full" onError={handleError} />
                  </UserGuideErrorBoundary>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Shown only on mobile */}
        <aside 
          className="md:hidden border-t border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto"
          aria-label="User guide navigation (mobile)"
        >
          <UserGuideNavigation className="h-full" />
        </aside>

        {/* Footer with keyboard shortcuts hint */}
        <div className="hidden sm:block border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Use arrow keys to navigate between sections</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};