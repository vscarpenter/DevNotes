/**
 * Main application layout component with two-panel interface
 * Provides resizable sidebar and main content area with responsive behavior
 * Requirements: 1.1, 1.2, 1.3
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useUserGuideStore } from '@/stores/userGuideStore';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { MainPanel } from './MainPanel';
import { UserGuideModal } from '@/components/userGuide';
import { PWAUpdateNotification } from '@/components/ui/PWAUpdateNotification';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    sidebarWidth,
    isSidebarCollapsed,
    setSidebarWidth,
    isDarkMode,
    isModalOpen
  } = useUIStore();

  const { isOpen: isUserGuideOpen, closeGuide } = useUserGuideStore();

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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        const { toggleSidebar } = useUIStore.getState();
        toggleSidebar();
      }
      
      // Escape to close mobile sidebar
      if (e.key === 'Escape' && isMobile && !isSidebarCollapsed) {
        useUIStore.getState().collapseSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isSidebarCollapsed]);

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
    <div className="flex h-screen bg-background text-foreground overflow-hidden antialiased">
      {/* Sidebar */}
      <aside
        className={cn(
          'relative flex-shrink-0 border-r border-border bg-surface/50 backdrop-blur-sm',
          'transition-all duration-300 ease-out',
          isMobile && isSidebarCollapsed && 'absolute inset-y-0 left-0 z-50 transform -translate-x-full',
          isMobile && !isSidebarCollapsed && 'absolute inset-y-0 left-0 z-50 shadow-xl',
          !isMobile && isSidebarCollapsed && 'w-0 overflow-hidden',
          !isMobile && !isSidebarCollapsed && 'overflow-visible shadow-sm'
        )}
        style={{
          width: isMobile ? (isSidebarCollapsed ? 0 : 280) : (isSidebarCollapsed ? 0 : sidebarWidth)
        }}
        aria-label="Navigation sidebar"
        aria-hidden={isSidebarCollapsed}
      >
        <Sidebar />
        
        {/* Resize handle - only show on desktop when sidebar is not collapsed */}
        {!isMobile && !isSidebarCollapsed && (
          <div
            ref={resizeRef}
            className={cn(
              'absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent',
              'hover:bg-primary/20 transition-all duration-200 ease-in-out',
              'group flex items-center justify-center focus-ring',
              isResizing && 'bg-primary/30'
            )}
            onMouseDown={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSidebarWidth(Math.max(250, sidebarWidth - 20));
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSidebarWidth(Math.min(500, sidebarWidth + 20));
              }
            }}
          >
            <div className="w-0.5 h-8 bg-border group-hover:bg-primary/60 transition-all duration-200" />
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in-0 duration-200"
          onClick={() => useUIStore.getState().collapseSidebar()}
          role="button"
          aria-label="Close sidebar"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              useUIStore.getState().collapseSidebar();
            }
          }}
        />
      )}

      {/* Main content area */}
      <main 
        className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-background to-surface/30"
        role="main"
        aria-label="Main content"
      >
        <MainPanel>
          {children}
        </MainPanel>
      </main>

      {/* User Guide Modal */}
      <UserGuideModal 
        isOpen={isUserGuideOpen} 
        onClose={closeGuide} 
      />

      {/* PWA Update Notification */}
      <PWAUpdateNotification />
    </div>
  );
};