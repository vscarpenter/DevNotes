import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TooltipConfig } from '@/types/userGuide';

interface UserGuideTooltipProps {
  config: TooltipConfig;
  children: React.ReactNode;
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
  transform?: string;
}

export const UserGuideTooltip: React.FC<UserGuideTooltipProps> = ({
  config,
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = (): TooltipPosition => {
    if (!triggerRef.current || !tooltipRef.current) {
      return { top: 0, left: 0 };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;
    let transform = '';

    switch (config.position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2);
        transform = 'translateX(-50%)';
        
        // Adjust if tooltip would go above viewport
        if (top < 8) {
          top = triggerRect.bottom + 8;
        }
        break;

      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2);
        transform = 'translateX(-50%)';
        
        // Adjust if tooltip would go below viewport
        if (top + tooltipRect.height > viewport.height - 8) {
          top = triggerRect.top - tooltipRect.height - 8;
        }
        break;

      case 'left':
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.left - tooltipRect.width - 8;
        transform = 'translateY(-50%)';
        
        // Adjust if tooltip would go left of viewport
        if (left < 8) {
          left = triggerRect.right + 8;
        }
        break;

      case 'right':
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.right + 8;
        transform = 'translateY(-50%)';
        
        // Adjust if tooltip would go right of viewport
        if (left + tooltipRect.width > viewport.width - 8) {
          left = triggerRect.left - tooltipRect.width - 8;
        }
        break;
    }

    // Ensure tooltip stays within viewport bounds
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewport.width - 8) {
      left = viewport.width - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewport.height - 8) {
      top = viewport.height - tooltipRect.height - 8;
    }

    return { top, left, transform };
  };

  const showTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, config.delay);
  };

  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleTriggerEvent = (event: React.SyntheticEvent) => {
    switch (config.trigger) {
      case 'hover':
        if (event.type === 'mouseenter') {
          showTooltip();
        } else if (event.type === 'mouseleave') {
          hideTooltip();
        }
        break;
      case 'focus':
        if (event.type === 'focus') {
          showTooltip();
        } else if (event.type === 'blur') {
          hideTooltip();
        }
        break;
      case 'click':
        if (event.type === 'click') {
          if (isVisible) {
            hideTooltip();
          } else {
            showTooltip();
          }
        }
        break;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      hideTooltip();
    }
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
  }, [isVisible, config.position]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        const newPosition = calculatePosition();
        setPosition(newPosition);
      }
    };

    const handleScroll = () => {
      if (isVisible) {
        hideTooltip();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isVisible]);

  const triggerProps: React.HTMLAttributes<HTMLDivElement> = {
    onKeyDown: handleKeyDown,
    ...(config.trigger === 'hover' && {
      onMouseEnter: handleTriggerEvent,
      onMouseLeave: handleTriggerEvent
    }),
    ...(config.trigger === 'focus' && {
      onFocus: handleTriggerEvent,
      onBlur: handleTriggerEvent,
      tabIndex: 0
    }),
    ...(config.trigger === 'click' && {
      onClick: handleTriggerEvent,
      tabIndex: 0
    })
  };

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform
      }}
      role="tooltip"
      aria-describedby={config.id}
    >
      <div className="relative">
        {config.content}
        {/* Arrow indicator */}
        <div
          className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            config.position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
            config.position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
            config.position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
            'left-[-4px] top-1/2 -translate-y-1/2'
          }`}
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={className}
        aria-describedby={isVisible ? config.id : undefined}
        {...triggerProps}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};