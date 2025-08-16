/**
 * Auto-save hook with debounced saving functionality
 * Requirements: 7.1, 7.2
 */

import { useCallback, useRef } from 'react';

interface UseAutoSaveOptions {
  onSave: (content: string) => Promise<void>;
  delay?: number;
}

interface UseAutoSaveReturn {
  scheduleAutoSave: (content: string) => void;
  forceSave: () => void;
  cancelAutoSave: () => void;
}

export const useAutoSave = ({ 
  onSave, 
  delay = 500 
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const timeoutRef = useRef<number | null>(null);
  const lastContentRef = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);

  const scheduleAutoSave = useCallback((content: string) => {
    // Don't schedule if content hasn't changed
    if (content === lastContentRef.current) {
      return;
    }

    // Update the last content reference
    lastContentRef.current = content;

    // Clear existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = window.setTimeout(async () => {
      if (isSavingRef.current) {
        // If already saving, reschedule
        scheduleAutoSave(content);
        return;
      }

      try {
        isSavingRef.current = true;
        await onSave(content);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Could implement retry logic here
      } finally {
        isSavingRef.current = false;
        timeoutRef.current = null;
      }
    }, delay);
  }, [onSave, delay]);

  const forceSave = useCallback(async () => {
    // Cancel any pending auto-save
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Save immediately if we have content and not already saving
    if (lastContentRef.current && !isSavingRef.current) {
      try {
        isSavingRef.current = true;
        await onSave(lastContentRef.current);
      } catch (error) {
        console.error('Force save failed:', error);
        throw error;
      } finally {
        isSavingRef.current = false;
      }
    }
  }, [onSave]);

  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    scheduleAutoSave,
    forceSave,
    cancelAutoSave
  };
};