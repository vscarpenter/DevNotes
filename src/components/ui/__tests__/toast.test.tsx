/**
 * Tests for Toast notification component
 * Requirements: 7.4, 7.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { 
  ToastProvider, 
  useToast, 
  useSuccessToast, 
  useErrorToast, 
  useWarningToast, 
  useInfoToast 
} from '../toast';

// Test component that uses toast hooks
const TestComponent: React.FC = () => {
  const { addToast, removeToast, clearToasts, toasts } = useToast();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  const showWarning = useWarningToast();
  const showInfo = useInfoToast();

  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      
      <button onClick={() => addToast({ type: 'info', title: 'Test Toast' })}>
        Add Toast
      </button>
      
      <button onClick={() => showSuccess('Success!', 'Operation completed')}>
        Success Toast
      </button>
      
      <button onClick={() => showError('Error!', 'Something went wrong')}>
        Error Toast
      </button>
      
      <button onClick={() => showWarning('Warning!', 'Please be careful')}>
        Warning Toast
      </button>
      
      <button onClick={() => showInfo('Info!', 'Just so you know')}>
        Info Toast
      </button>
      
      <button onClick={() => addToast({ 
        type: 'success', 
        title: 'With Action',
        action: { label: 'Undo', onClick: () => console.log('Undo clicked') }
      })}>
        Toast with Action
      </button>
      
      <button onClick={clearToasts}>
        Clear All
      </button>
      
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>
          Remove First
        </button>
      )}
    </div>
  );
};

// Mock timers
vi.useFakeTimers();

describe('Toast System', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    console.log = vi.fn(); // Mock console.log for action tests
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  it('renders toast provider without errors', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useToast();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponentWithoutProvider />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    console.error = originalError;
  });

  it('adds and displays toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const addButton = screen.getByText('Add Toast');
    fireEvent.click(addButton);

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('displays different toast types with correct styling', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Test success toast
    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();

    // Test error toast
    fireEvent.click(screen.getByText('Error Toast'));
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Test warning toast
    fireEvent.click(screen.getByText('Warning Toast'));
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Please be careful')).toBeInTheDocument();

    // Test info toast
    fireEvent.click(screen.getByText('Info Toast'));
    expect(screen.getByText('Info!')).toBeInTheDocument();
    expect(screen.getByText('Just so you know')).toBeInTheDocument();
  });

  it('removes toasts manually', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add a toast
    fireEvent.click(screen.getByText('Add Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Remove the toast
    fireEvent.click(screen.getByText('Remove First'));
    
    // Wait for animation
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('clears all toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add multiple toasts
    fireEvent.click(screen.getByText('Success Toast'));
    fireEvent.click(screen.getByText('Error Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('2');

    // Clear all toasts
    fireEvent.click(screen.getByText('Clear All'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('auto-removes toasts after duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add a success toast (should auto-remove after 5000ms)
    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });
  });

  it('does not auto-remove error toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add an error toast (should not auto-remove)
    fireEvent.click(screen.getByText('Error Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Error toast should still be there
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('handles toast actions', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add toast with action
    fireEvent.click(screen.getByText('Toast with Action'));
    
    const actionButton = screen.getByText('Undo');
    fireEvent.click(actionButton);

    expect(console.log).toHaveBeenCalledWith('Undo clicked');
  });

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add a toast
    fireEvent.click(screen.getByText('Add Toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Click close button
    const closeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(closeButton);

    // Wait for animation
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('handles multiple toasts correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add multiple toasts
    fireEvent.click(screen.getByText('Success Toast'));
    fireEvent.click(screen.getByText('Error Toast'));
    fireEvent.click(screen.getByText('Warning Toast'));

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  it('applies correct CSS classes for toast types', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Test success toast border color
    fireEvent.click(screen.getByText('Success Toast'));
    const successToast = screen.getByText('Success!').closest('div');
    expect(successToast).toHaveClass('border-l-green-500');

    // Test error toast border color
    fireEvent.click(screen.getByText('Error Toast'));
    const errorToast = screen.getByText('Error!').closest('div');
    expect(errorToast).toHaveClass('border-l-red-500');
  });

  it('handles toast animation states', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add a toast
    fireEvent.click(screen.getByText('Add Toast'));
    
    const toastElement = screen.getByText('Test Toast').closest('div');
    
    // Initially should have translate-x-full (off-screen)
    // Then should animate to translate-x-0 (on-screen)
    await waitFor(() => {
      expect(toastElement).toHaveClass('translate-x-0', 'opacity-100');
    });
  });
});