import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { UserGuideTooltip } from '../UserGuideTooltip';
import { TooltipConfig } from '@/types/userGuide';

// Mock createPortal to render tooltip in the same container
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node
}));

describe('UserGuideTooltip', () => {
  const defaultConfig: TooltipConfig = {
    id: 'test-tooltip',
    content: 'Test tooltip content',
    position: 'top',
    trigger: 'hover',
    delay: 100
  };

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Hover trigger', () => {
    it('shows tooltip on mouse enter after delay', async () => {
      render(
        <UserGuideTooltip config={defaultConfig}>
          <button>Trigger</button>
        </UserGuideTooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      
      fireEvent.mouseEnter(trigger);
      
      // Tooltip should not be visible immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      
      // Fast-forward time to trigger delay
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <UserGuideTooltip config={defaultConfig}>
          <button>Trigger</button>
        </UserGuideTooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      
      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      // Hide tooltip
      fireEvent.mouseLeave(trigger);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Focus trigger', () => {
    it('shows tooltip on focus', async () => {
      const focusConfig: TooltipConfig = {
        ...defaultConfig,
        trigger: 'focus'
      };

      render(
        <UserGuideTooltip config={focusConfig}>
          <button>Trigger</button>
        </UserGuideTooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      
      fireEvent.focus(trigger);
      
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('sets proper ARIA attributes', async () => {
      render(
        <UserGuideTooltip config={defaultConfig}>
          <button>Trigger</button>
        </UserGuideTooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Trigger' });
      
      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('aria-describedby', 'test-tooltip');
        expect(trigger).toHaveAttribute('aria-describedby', 'test-tooltip');
      });
    });
  });
});