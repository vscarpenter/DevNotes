import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTooltip } from '../useTooltip';

// Mock the tooltip content
vi.mock('@/lib/userGuide/tooltipContent', () => ({
  getTooltipConfig: vi.fn((id: string) => {
    const configs: Record<string, any> = {
      'test-tooltip': {
        id: 'test-tooltip',
        content: 'Test content',
        position: 'top',
        trigger: 'hover',
        delay: 100
      }
    };
    return configs[id] || null;
  })
}));

describe('useTooltip', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('showTooltip', () => {
    it('shows tooltip after delay', () => {
      const onShow = vi.fn();
      const { result } = renderHook(() => useTooltip({ onShow }));

      act(() => {
        result.current.showTooltip('test-tooltip');
      });

      expect(result.current.isTooltipVisible('test-tooltip')).toBe(false);
      expect(onShow).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isTooltipVisible('test-tooltip')).toBe(true);
      expect(onShow).toHaveBeenCalledWith('test-tooltip');
    });

    it('does not show tooltip when disabled', () => {
      const onShow = vi.fn();
      const { result } = renderHook(() => useTooltip({ disabled: true, onShow }));

      act(() => {
        result.current.showTooltip('test-tooltip');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isTooltipVisible('test-tooltip')).toBe(false);
      expect(onShow).not.toHaveBeenCalled();
    });
  });

  describe('hideTooltip', () => {
    it('hides visible tooltip after delay', () => {
      const onHide = vi.fn();
      const { result } = renderHook(() => useTooltip({ onHide }));

      // Show tooltip first
      act(() => {
        result.current.showTooltip('test-tooltip');
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isTooltipVisible('test-tooltip')).toBe(true);

      // Hide tooltip
      act(() => {
        result.current.hideTooltip('test-tooltip');
      });

      // Should still be visible immediately
      expect(result.current.isTooltipVisible('test-tooltip')).toBe(true);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isTooltipVisible('test-tooltip')).toBe(false);
      expect(onHide).toHaveBeenCalledWith('test-tooltip');
    });
  });

  describe('getActiveTooltips', () => {
    it('returns array of visible tooltip IDs', () => {
      const { result } = renderHook(() => useTooltip());

      expect(result.current.getActiveTooltips()).toEqual([]);

      // Show tooltip
      act(() => {
        result.current.showTooltip('test-tooltip');
        vi.advanceTimersByTime(100);
      });

      expect(result.current.getActiveTooltips()).toEqual(['test-tooltip']);
    });
  });
});