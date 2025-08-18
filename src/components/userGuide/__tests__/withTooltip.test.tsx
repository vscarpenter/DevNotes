import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withTooltip, TooltipWrapper } from '../withTooltip';

// Mock the tooltip content
vi.mock('@/lib/userGuide/tooltipContent', () => ({
  getTooltipConfig: vi.fn((id: string) => {
    const configs: Record<string, any> = {
      'test-tooltip': {
        id: 'test-tooltip',
        content: 'Test tooltip content',
        position: 'top',
        trigger: 'hover',
        delay: 100
      }
    };
    return configs[id] || null;
  })
}));

// Mock createPortal to render tooltip in the same container
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node
}));

describe('withTooltip HOC', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // Test component
  const TestComponent = React.forwardRef<HTMLButtonElement, { children: React.ReactNode }>(
    ({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )
  );
  TestComponent.displayName = 'TestComponent';

  describe('withTooltip HOC', () => {
    it('renders component without tooltip when no tooltip props provided', () => {
      const WrappedComponent = withTooltip(TestComponent);
      
      render(
        <WrappedComponent>
          Test Button
        </WrappedComponent>
      );

      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders component with tooltip using tooltipId', async () => {
      const WrappedComponent = withTooltip(TestComponent);
      
      render(
        <WrappedComponent tooltipId="test-tooltip">
          Test Button
        </WrappedComponent>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      
      fireEvent.mouseEnter(button);
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });
  });

  describe('TooltipWrapper component', () => {
    it('renders children without tooltip when no tooltip props provided', () => {
      render(
        <TooltipWrapper>
          <button>Test Button</button>
        </TooltipWrapper>
      );

      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});