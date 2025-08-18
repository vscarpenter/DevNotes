import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './button';

export const PWAUpdatePrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  // PWA service worker registration
  useEffect(() => {
    // Check if we're in a PWA environment
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setNeedRefresh(true);
      });

      // Check for existing service worker
      navigator.serviceWorker.ready.then(() => {
        setOfflineReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    // Reload the page to activate the new service worker
    window.location.reload();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  // Show offline ready notification briefly
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => {
        setOfflineReady(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, setOfflineReady]);

  if (offlineReady) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-800 dark:text-green-200">
              DevNotes is ready to work offline!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showPrompt || !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Update Available
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
          A new version of DevNotes is available with improvements and bug fixes.
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
          <Button variant="outline" onClick={handleDismiss} size="sm">
            Later
          </Button>
        </div>
      </div>
    </div>
  );
};