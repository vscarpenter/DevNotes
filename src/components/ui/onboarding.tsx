/**
 * Onboarding components for new user guided tour
 * Requirements: 10.1, 10.2
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Play } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  className?: string;
}

interface TooltipProps {
  step: OnboardingStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  targetElement: HTMLElement | null;
}

const Tooltip: React.FC<TooltipProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  targetElement
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (targetElement && tooltipRef.current) {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (step.position || 'bottom') {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 10;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 10;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }
      if (top < 10) top = 10;
      if (top + tooltipRect.height > viewportHeight - 10) {
        top = viewportHeight - tooltipRect.height - 10;
      }

      setPosition({ top, left });
    }
  }, [targetElement, step.position]);

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
      style={{ top: position.top, left: position.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
            {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {step.content}
        </p>
      </div>

      {/* Action Button */}
      {step.action && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={step.action.onClick}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {step.action.label}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentStepIndex === 0}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentStepIndex
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : index < currentStepIndex
                  ? 'bg-green-500 dark:bg-green-400'
                  : 'bg-gray-300 dark:bg-gray-600'
              )}
            />
          ))}
        </div>

        {isLastStep ? (
          <Button size="sm" onClick={onComplete} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4 mr-1" />
            Finish
          </Button>
        ) : (
          <Button size="sm" onClick={onNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  className
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isOpen && currentStep?.target) {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      setTargetElement(element);

      if (element) {
        // Scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });

        // Add highlight class
        element.classList.add('onboarding-highlight');
      }
    }

    return () => {
      // Clean up highlight classes
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen || !currentStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[55]" />

      {/* Spotlight effect for highlighted element */}
      {targetElement && (
        <div
          className="fixed z-[56] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px'
          }}
        />
      )}

      {/* Tooltip */}
      <Tooltip
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onComplete={handleComplete}
        targetElement={targetElement}
      />
    </>
  );
};

interface OnboardingWelcomeProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  isOpen,
  onStartTour,
  onSkip
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to DevNotes!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Let's take a quick tour to help you get started with organizing your notes and boosting your productivity.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Skip Tour
            </Button>
            <Button
              onClick={onStartTour}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};