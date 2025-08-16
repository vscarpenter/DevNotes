/**
 * Tests for Loading components
 * Requirements: 7.4, 7.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import {
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  ProgressBar,
  LoadingSkeleton,
  LoadingCard,
  LoadingState
} from '../loading';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6', 'animate-spin');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4', 'animate-spin');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8', 'animate-spin');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="text-blue-500" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('text-blue-500');
  });
});

describe('LoadingOverlay', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows overlay when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows custom loading message', () => {
    render(
      <LoadingOverlay isLoading={true} message="Saving...">
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoadingOverlay isLoading={false} className="custom-class">
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingButton isLoading={false}>
        Click me
      </LoadingButton>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    const { container } = render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading text when provided', () => {
    render(
      <LoadingButton isLoading={true} loadingText="Saving...">
        Click me
      </LoadingButton>
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <LoadingButton isLoading={false} disabled={true}>
        Click me
      </LoadingButton>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(
      <LoadingButton isLoading={false} onClick={onClick}>
        Click me
      </LoadingButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not handle click when loading', () => {
    const onClick = vi.fn();
    render(
      <LoadingButton isLoading={true} onClick={onClick}>
        Click me
      </LoadingButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('ProgressBar', () => {
  it('renders with correct progress', () => {
    render(<ProgressBar progress={50} />);
    
    const progressFill = document.querySelector('.bg-primary');
    expect(progressFill).toHaveStyle('width: 50%');
  });

  it('clamps progress to 0-100 range', () => {
    const { rerender } = render(<ProgressBar progress={150} />);
    
    let progressFill = document.querySelector('.bg-primary');
    expect(progressFill).toHaveStyle('width: 100%');

    rerender(<ProgressBar progress={-50} />);
    progressFill = document.querySelector('.bg-primary');
    expect(progressFill).toHaveStyle('width: 0%');
  });

  it('shows percentage when enabled', () => {
    render(<ProgressBar progress={75} showPercentage={true} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows label when provided', () => {
    render(<ProgressBar progress={50} label="Uploading..." />);
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('shows both label and percentage', () => {
    render(
      <ProgressBar 
        progress={25} 
        label="Processing..." 
        showPercentage={true} 
      />
    );
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});

describe('LoadingSkeleton', () => {
  it('renders single line by default', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeletonLines = container.querySelectorAll('.bg-muted');
    expect(skeletonLines).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    const { container } = render(<LoadingSkeleton lines={3} />);
    const skeletonLines = container.querySelectorAll('.bg-muted');
    expect(skeletonLines).toHaveLength(3);
  });

  it('applies animate-pulse class', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('LoadingCard', () => {
  it('renders loading card structure', () => {
    const { container } = render(<LoadingCard />);
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container.querySelector('.bg-card')).toBeInTheDocument();
    expect(container.querySelectorAll('.bg-muted')).toHaveLength(6); // Avatar + title + subtitle + 3 content lines
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingCard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('LoadingState', () => {
  it('renders children when not loading and no error', () => {
    render(
      <LoadingState isLoading={false} error={null}>
        <div>Content</div>
      </LoadingState>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    const { container } = render(
      <LoadingState isLoading={true} error={null}>
        <div>Content</div>
      </LoadingState>
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    render(
      <LoadingState isLoading={false} error="Something went wrong">
        <div>Content</div>
      </LoadingState>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows retry button when retryAction is provided', () => {
    const retryAction = vi.fn();
    render(
      <LoadingState 
        isLoading={false} 
        error="Something went wrong" 
        retryAction={retryAction}
      >
        <div>Content</div>
      </LoadingState>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(retryAction).toHaveBeenCalled();
  });

  it('uses custom loading component', () => {
    const customLoading = <div>Custom loading...</div>;
    render(
      <LoadingState 
        isLoading={true} 
        error={null} 
        loadingComponent={customLoading}
      >
        <div>Content</div>
      </LoadingState>
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('uses custom error component', () => {
    const customError = <div>Custom error message</div>;
    render(
      <LoadingState 
        isLoading={false} 
        error="Something went wrong" 
        errorComponent={customError}
      >
        <div>Content</div>
      </LoadingState>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('prioritizes error over loading', () => {
    render(
      <LoadingState isLoading={true} error="Something went wrong">
        <div>Content</div>
      </LoadingState>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });
});