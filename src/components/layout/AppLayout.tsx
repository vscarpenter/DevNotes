/**
 * Main application layout component with two-panel interface
 * Provides resizable sidebar and main content area with responsive behavior
 * Requirements: 1.1, 1.2, 1.3
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { MainPanel } from './MainPanel';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    sidebarWidth,
    isSidebarCollapsed,
    setSidebarWidth,
    isDarkMode
  } = useUIStore();

  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;
    
    // Clamp width between 250px and 500px
    const clampedWidth = Math.max(250, Math.min(500, newWidth));
    setSidebarWidth(clampedWidth);
  }, [isResizing, setSidebarWidth]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResizeMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          'relative flex-shrink-0 border-r border-border transition-all duration-200',
          isMobile && isSidebarCollapsed && 'absolute inset-y-0 left-0 z-50',
          isMobile && isSidebarCollapsed && 'transform -translate-x-full',
          isMobile && !isSidebarCollapsed && 'absolute inset-y-0 left-0 z-50 shadow-lg',
          !isMobile && isSidebarCollapsed && 'w-0 overflow-hidden',
          !isMobile && !isSidebarCollapsed && 'overflow-visible'
        )}
        style={{
          width: isMobile ? (isSidebarCollapsed ? 0 : 280) : (isSidebarCollapsed ? 0 : sidebarWidth)
        }}
      >
        <Sidebar />
        
        {/* Resize handle - only show on desktop when sidebar is not collapsed */}
        {!isMobile && !isSidebarCollapsed && (
          <div
            ref={resizeRef}
            className={cn(
              'absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary/20 transition-colors',
              'group flex items-center justify-center',
              isResizing && 'bg-primary/30'
            )}
            onMouseDown={handleResizeStart}
          >
            <div className="w-0.5 h-8 bg-border group-hover:bg-primary/50 transition-colors" />
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => useUIStore.getState().collapseSidebar()}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <MainPanel>
          {children}
        </MainPanel>
      </div>
    </div>
  );
};