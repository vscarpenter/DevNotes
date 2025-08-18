import React from 'react';
import { UserGuideTooltip } from './UserGuideTooltip';
import { getTooltipConfig } from '@/lib/userGuide/tooltipContent';

interface WithTooltipProps {
  tooltipId?: string;
  tooltipContent?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipTrigger?: 'hover' | 'focus' | 'click';
  tooltipDelay?: number;
  className?: string;
}

export function withTooltip<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithTooltipComponent = React.forwardRef<any, P & WithTooltipProps>(
    (props, ref) => {
      const {
        tooltipId,
        tooltipContent,
        tooltipPosition = 'top',
        tooltipTrigger = 'hover',
        tooltipDelay = 500,
        className,
        ...restProps
      } = props;

      // If no tooltip configuration is provided, render the component without tooltip
      if (!tooltipId && !tooltipContent) {
        return <WrappedComponent {...(restProps as P)} ref={ref} />;
      }

      // Get tooltip config from content management system or use provided props
      let tooltipConfig;
      if (tooltipId) {
        tooltipConfig = getTooltipConfig(tooltipId);
        if (!tooltipConfig) {
          console.warn(`Tooltip config not found for ID: ${tooltipId}`);
          return <WrappedComponent {...(restProps as P)} ref={ref} />;
        }
      } else if (tooltipContent) {
        tooltipConfig = {
          id: `tooltip-${Math.random().toString(36).substr(2, 9)}`,
          content: tooltipContent,
          position: tooltipPosition,
          trigger: tooltipTrigger,
          delay: tooltipDelay
        };
      }

      if (!tooltipConfig) {
        return <WrappedComponent {...(restProps as P)} ref={ref} />;
      }

      return (
        <UserGuideTooltip config={tooltipConfig} className={className}>
          <WrappedComponent {...(restProps as P)} ref={ref} />
        </UserGuideTooltip>
      );
    }
  );

  WithTooltipComponent.displayName = `withTooltip(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithTooltipComponent;
}

// Convenience component for adding tooltips without HOC
interface TooltipWrapperProps extends WithTooltipProps {
  children: React.ReactNode;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  tooltipId,
  tooltipContent,
  tooltipPosition = 'top',
  tooltipTrigger = 'hover',
  tooltipDelay = 500,
  className
}) => {
  // Get tooltip config from content management system or use provided props
  let tooltipConfig;
  if (tooltipId) {
    tooltipConfig = getTooltipConfig(tooltipId);
    if (!tooltipConfig) {
      console.warn(`Tooltip config not found for ID: ${tooltipId}`);
      return <>{children}</>;
    }
  } else if (tooltipContent) {
    tooltipConfig = {
      id: `tooltip-${Math.random().toString(36).substr(2, 9)}`,
      content: tooltipContent,
      position: tooltipPosition,
      trigger: tooltipTrigger,
      delay: tooltipDelay
    };
  }

  if (!tooltipConfig) {
    return <>{children}</>;
  }

  return (
    <UserGuideTooltip config={tooltipConfig} className={className}>
      {children}
    </UserGuideTooltip>
  );
};