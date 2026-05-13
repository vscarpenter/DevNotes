import React, { useEffect } from 'react';
import { AppErrorBoundary } from '@/components/ui/error-boundary';
import { PWAInstallPrompt, PWAUpdatePrompt } from '@/components/ui';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/stores/appStore';
import { useUIStore } from '@/stores/uiStore';

function App() {
  const { initialize } = useAppStore();
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Inkwell flips palettes via [data-theme="dark"|"light"] on <html>.
  // 'system' clears the attribute so prefers-color-scheme drives the cascade.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <AppErrorBoundary>
      <AppLayout />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </AppErrorBoundary>
  );
}

export default App;