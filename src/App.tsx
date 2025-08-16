import React, { useEffect } from 'react';
import { AppErrorBoundary } from '@/components/ui/error-boundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/stores/appStore';

function App() {
  const { initialize } = useAppStore();

  // Initialize the application on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AppErrorBoundary>
      <AppLayout />
    </AppErrorBoundary>
  );
}

export default App;