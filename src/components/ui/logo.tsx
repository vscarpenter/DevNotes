/**
 * DevNotes Logo Component
 * Professional SVG logo with consistent branding
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'text';
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  variant = 'full' 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  const LogoIcon = () => (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      'aspect-square'
    )}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
          </linearGradient>
        </defs>
        
        {/* Main circle background */}
        <circle 
          cx="16" 
          cy="16" 
          r="14" 
          fill="url(#logoGradient)"
          className="drop-shadow-sm"
        />
        
        {/* Code brackets */}
        <path 
          d="M10 12L7 16L10 20M22 12L25 16L22 20" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
        
        {/* Document lines */}
        <path 
          d="M12 14H20M12 16H18M12 18H20" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className="opacity-90"
        />
      </svg>
    </div>
  );

  const LogoText = () => (
    <div className="flex flex-col">
      <span className="font-bold text-foreground leading-none">
        DevNotes
      </span>
      <span className="text-xs text-muted-foreground leading-none hidden sm:block">
        Developer Notes
      </span>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex items-center', className)}>
        <LogoText />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoIcon />
      <LogoText />
    </div>
  );
};

export default Logo;