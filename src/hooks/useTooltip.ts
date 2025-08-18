import { useState, useCallback, useRef, useEffect } from 'react';
import { TooltipConfig } from '@/types/userGuide';
import { getTooltipConfig } from '@/lib/userGuide/tooltipContent';

interface UseTooltipOptions {
  disabled?: boolean;
  onShow?: (tooltipId: string) => void;
  onHide?: (tooltipId: string) => void;
}

interface UseTooltipReturn {
  showTooltip: (tooltipId: string, element?: HTMLElement) => void;
  hideTooltip: (tooltipId: string) => void;
  hideAllTooltips: () => void;
  isTooltipVisible: (tooltipId: string) => boolean;
  getActiveTooltips: () => string[];
}

export const useTooltip = (options: UseTooltipOptions = {}): UseTooltipReturn => {
  const [visibleTooltips, setVisibleTooltips] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const showTooltip = useCallback((tooltipId: string, element?: HTMLElement) => {
    if (options.disabled) return;

    const config = getTooltipConfig(tooltipId);
    if (!config) {
      console.warn(`Tooltip config not found for ID: ${tooltipId}`);
      return;
    }

    // Clear any existing timeout for this tooltip
    const existingTimeout = timeoutsRef.current.get(tooltipId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set timeout to show tooltip after delay
    const timeout = setTimeout(() => {
      setVisibleTooltips(prev => new Set([...prev, tooltipId]));
      options.onShow?.(tooltipId);
      timeoutsRef.current.delete(tooltipId);
    }, config.delay);

    timeoutsRef.current.set(tooltipId, timeout);
  }, [options]);

  const hideTooltip = useCallback((tooltipId: string) => {
    // Clear any pending show timeout
    const existingTimeout = timeoutsRef.current.get(tooltipId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(tooltipId);
    }

    // Hide tooltip with a small delay to prevent flickering
    const hideTimeout = setTimeout(() => {
      setVisibleTooltips(prev => {
        const newSet = new Set(prev);
        newSet.delete(tooltipId);
        return newSet;
      });
      options.onHide?.(tooltipId);
    }, 100);

    timeoutsRef.current.set(`hide-${tooltipId}`, hideTimeout);
  }, [options]);

  const hideAllTooltips = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();

    // Hide all visible tooltips
    visibleTooltips.forEach(tooltipId => {
      options.onHide?.(tooltipId);
    });

    setVisibleTooltips(new Set());
  }, [visibleTooltips, options]);

  const isTooltipVisible = useCallback((tooltipId: string): boolean => {
    return visibleTooltips.has(tooltipId);
  }, [visibleTooltips]);

  const getActiveTooltips = useCallback((): string[] => {
    return Array.from(visibleTooltips);
  }, [visibleTooltips]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Hide tooltips on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visibleTooltips.size > 0) {
        hideAllTooltips();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visibleTooltips.size, hideAllTooltips]);

  // Hide tooltips on scroll or resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (visibleTooltips.size > 0) {
        hideAllTooltips();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [visibleTooltips.size, hideAllTooltips]);

  return {
    showTooltip,
    hideTooltip,
    hideAllTooltips,
    isTooltipVisible,
    getActiveTooltips
  };
};