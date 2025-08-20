import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UserGuideModal } from '../UserGuideModal';
import { MemoryManager, LazyContentLoader } from '../../../lib/userGuide/performanceOptimizations';

// Mock the components and utilities
vi.mock('../UserGuideContent', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(({ onError }) => (
    <div data-testid="user-guide-content">
      <button 
        data-testid="trigger-error"
        onClick={() => onError && onError(new Error('Test error'))}
      >
        Trigger Error
      </button>
      <button 
        data-testid="load-content"
        onClick={() => LazyContentLoader.loadSection('test-section')}
      >
        Load Content
      </button>
    </div>
  )),
}));

// Mock the performance optimizations module
vi.mock('../../../lib/userGuide/performanceOptimizations', () => ({
  MemoryManager: {
    startMemoryManagement: vi.fn(),
    stopMemoryManagement: vi.fn(),
    clearAllCaches: vi.fn(),
    performCacheCleanup: vi.fn(),
    destroy: vi.fn(),
    isMemoryUsageHigh: vi.fn(() => false),
  },
  LazyContentLoader: {
    loadSection: vi.fn().mockResolvedValue({}),
    clearCache: vi.fn(),
    cancelLoading: vi.fn(),
    queueSectionForPreload: vi.fn(),
  },
}));

describe('UserGuideModal Memory Management', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should perform regular cleanup when memory usage is normal', async () => {
    // Mock memory usage to be normal
    vi.mocked(MemoryManager.isMemoryUsageHigh).mockReturnValue(false);

    render(<UserGuideModal isOpen={true} onClose={() => {}} />);

    // Fast-forward time to trigger cleanup
    act(() => {
      vi.advanceTimersByTime(15000); // 15 seconds
    });

    // Should call the regular cleanup
    expect(MemoryManager.performCacheCleanup).toHaveBeenCalled();
    expect(MemoryManager.clearAllCaches).not.toHaveBeenCalled();
  });

  it('should perform aggressive cleanup when memory usage is high', async () => {
    // Mock memory usage to be high
    vi.mocked(MemoryManager.isMemoryUsageHigh).mockReturnValue(true);

    render(<UserGuideModal isOpen={true} onClose={() => {}} />);

    // Fast-forward time to trigger cleanup
    act(() => {
      vi.advanceTimersByTime(15000); // 15 seconds
    });

    // Should call the aggressive cleanup
    expect(MemoryManager.clearAllCaches).toHaveBeenCalled();
    expect(LazyContentLoader.cancelLoading).toHaveBeenCalled();
  });

  it('should clean up resources when modal is closed', async () => {
    const { unmount } = render(<UserGuideModal isOpen={true} onClose={() => {}} />);

    // Unmount to simulate closing the modal
    unmount();

    // Should clean up resources
    expect(LazyContentLoader.cancelLoading).toHaveBeenCalled();
    expect(MemoryManager.clearAllCaches).toHaveBeenCalled();
  });

  it('should handle errors and clean up resources', async () => {
    render(<UserGuideModal isOpen={true} onClose={() => {}} />);

    // Trigger an error
    const errorButton = screen.getByTestId('trigger-error');
    fireEvent.click(errorButton);

    // Should clean up resources on error
    expect(LazyContentLoader.cancelLoading).toHaveBeenCalled();
    expect(MemoryManager.clearAllCaches).toHaveBeenCalled();

    // Should show error UI
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });

  it('should reset error state and retry when Try Again is clicked', async () => {
    render(<UserGuideModal isOpen={true} onClose={() => {}} />);

    // Trigger an error
    const errorButton = screen.getByTestId('trigger-error');
    fireEvent.click(errorButton);

    // Click Try Again
    const tryAgainButton = screen.getByText(/Try Again/i);
    fireEvent.click(tryAgainButton);

    // Should clean up resources and reset error state
    expect(LazyContentLoader.clearCache).toHaveBeenCalled();
    expect(MemoryManager.clearAllCaches).toHaveBeenCalled();

    // Error UI should be gone
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });
});