/**
 * PWAUpdateNotification - Handles PWA update notifications with improved UX
 */

import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './button';

interface PWAUpdateNotificationProps {
  className?: string;
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({ 
  className = '' 
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    onNeedRefresh() {
      console.log('SW needs refresh');
      setShowNotification(true);
    },
    onOfflineReady() {
      console.log('SW offline ready');
    },
  });

  // Show notification when update is available
  useEffect(() => {
    if (needRefresh) {
      setShowNotification(true);
    }
  }, [needRefresh]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker(true);
      setShowNotification(false);
      setNeedRefresh(false);
    } catch (error) {
      console.error('Failed to update service worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setNeedRefresh(false);
  };

  const handleLater = () => {
    setShowNotification(false);
    // Don't reset needRefresh so it can show again later
  };

  if (!showNotification || (!needRefresh && !offlineReady)) {
    return null;
  }

  if (offlineReady && !needRefresh) {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg ${className}`}>
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              App Ready Offline
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              DevNotes is now available offline!
            </p>
          </div>
          <button
            onClick={() => setOfflineReady(false)}
            className="ml-2 text-green-400 hover:text-green-600 dark:text-green-300 dark:hover:text-green-100 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex items-start">
        <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Update Available
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            A new version of DevNotes is available with improvements and bug fixes.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Update Now
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLater}
              disabled={isUpdating}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          disabled={isUpdating}
          className="ml-2 text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 transition-colors disabled:opacity-50"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};