/**
 * Animation components and utilities for smooth UI transitions
 * Requirements: 9.2, 10.1
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 300,
  className
}) => {
  return (
    <div
      className={cn('animate-fade-in', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 300,
  className
}) => {
  const animationClass = {
    up: 'animate-slide-in-up',
    down: 'animate-slide-in-down',
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right'
  }[direction];

  return (
    <div
      className={cn(animationClass, className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 200,
  className
}) => {
  return (
    <div
      className={cn('animate-scale-in', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 50,
  className
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ children, className }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {children}
    </div>
  );
};

interface BounceProps {
  children: React.ReactNode;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({ children, className }) => {
  return (
    <div className={cn('animate-bounce', className)}>
      {children}
    </div>
  );
};

interface SpinProps {
  children: React.ReactNode;
  className?: string;
}

export const Spin: React.FC<SpinProps> = ({ children, className }) => {
  return (
    <div className={cn('animate-spin', className)}>
      {children}
    </div>
  );
};

interface TransitionGroupProps {
  children: React.ReactNode;
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  className?: string;
}

export const TransitionGroup: React.FC<TransitionGroupProps> = ({
  children,
  show,
  enter = 'transition-all duration-300 ease-out',
  enterFrom = 'opacity-0 scale-95',
  enterTo = 'opacity-100 scale-100',
  leave = 'transition-all duration-200 ease-in',
  leaveFrom = 'opacity-100 scale-100',
  leaveTo = 'opacity-0 scale-95',
  className
}) => {
  const [shouldRender, setShouldRender] = React.useState(show);
  const [isVisible, setIsVisible] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to ensure element is rendered before animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  const transitionClass = isVisible
    ? `${enter} ${enterTo}`
    : `${leave} ${leaveTo}`;

  const initialClass = isVisible ? enterFrom : leaveFrom;

  return (
    <div className={cn(transitionClass, className)} style={{ transition: 'all 0.3s ease' }}>
      {children}
    </div>
  );
};

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showLabel = false,
  animated = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2', className)}>
      <div
        className={cn(
          'h-2 bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300 ease-out',
          animated && 'animate-pulse'
        )}
        style={{ width: `${clampedProgress}%` }}
      />
      {showLabel && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-gray-200 dark:bg-gray-700 rounded',
            index === lines - 1 ? 'w-3/4' : 'w-full',
            lines > 1 ? 'h-4 mb-2' : 'h-4'
          )}
        />
      ))}
    </div>
  );
};

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-40',
        className
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className
}) => {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-scale-in',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className
}) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
        />
      ))}
    </div>
  );
};