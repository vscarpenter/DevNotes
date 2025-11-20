/**
 * Skeleton loading component for displaying placeholder content
 * Uses gradient animation for smooth loading effect
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  animation = 'wave',
}) => {
  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-sm',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'loading-pulse',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showAvatar = false,
}) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Skeleton variant="rectangular" height={12} />
        <Skeleton variant="rectangular" height={12} width="90%" />
        <Skeleton variant="rectangular" height={12} width="75%" />
      </div>
    </div>
  );
};

interface SkeletonNoteListProps {
  count?: number;
  className?: string;
}

export const SkeletonNoteList: React.FC<SkeletonNoteListProps> = ({
  count = 5,
  className,
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 border-b border-border space-y-2"
        >
          <div className="flex items-start justify-between">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width={60} height={16} />
          </div>
          <Skeleton variant="text" width="90%" height={12} />
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={80} height={12} />
            <Skeleton variant="text" width={60} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
};

interface SkeletonFolderTreeProps {
  depth?: number;
  className?: string;
}

export const SkeletonFolderTree: React.FC<SkeletonFolderTreeProps> = ({
  depth = 3,
  className,
}) => {
  const renderFolder = (level: number) => {
    if (level > depth) return null;

    return (
      <div className="space-y-1">
        {Array.from({ length: Math.max(1, depth - level + 1) }).map((_, i) => (
          <div key={i} style={{ paddingLeft: `${level * 16}px` }}>
            <div className="flex items-center gap-2 p-2">
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width={120} />
            </div>
            {level < depth && i === 0 && renderFolder(level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('py-2', className)}>
      {renderFolder(0)}
    </div>
  );
};
