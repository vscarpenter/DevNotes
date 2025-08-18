/**
 * Backup Reminder Modal for data backup notifications and health checks
 * Requirements: 7.5, 8.1
 */

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Download, Settings, RefreshCw } from 'lucide-react';
import { backupReminderService, DataHealthCheck } from '../../lib/utils/backupReminder';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import { useUIStore } from '../../stores/uiStore';

interface BackupReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
}

export const BackupReminderModal: React.FC<BackupReminderModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const { openModal } = useUIStore();
  const { addToast } = useToast();

  const [healthCheck, setHealthCheck] = useState<DataHealthCheck | null>(null);
  const [isLoadingHealthCheck, setIsLoadingHealthCheck] = useState(false);
  const [isFixingIssues, setIsFixingIssues] = useState(false);

  const settings = backupReminderService.getSettings();
  const daysSinceLastBackup = backupReminderService.getDaysSinceLastBackup();

  useEffect(() => {
    if (isOpen) {
      performHealthCheck();
    }
  }, [isOpen]);

  const performHealthCheck = async () => {
    setIsLoadingHealthCheck(true);
    try {
      const result = await backupReminderService.performHealthCheck();
      setHealthCheck(result);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to perform health check' });
    } finally {
      setIsLoadingHealthCheck(false);
    }
  };

  const handleCreateBackup = () => {
    backupReminderService.markBackupCompleted();
    backupReminderService.markReminderShown();
    onExport();
    onClose();
  };

  const handleRemindLater = () => {
    backupReminderService.markReminderShown();
    onClose();
  };

  const handleDisableReminders = () => {
    backupReminderService.updateSettings({ enabled: false });
    addToast({ type: 'success', title: 'Backup reminders disabled' });
    onClose();
  };

  const handleFixIssues = async () => {
    if (!healthCheck || healthCheck.issues.length === 0) return;

    setIsFixingIssues(true);
    try {
      const result = await backupReminderService.fixDataIntegrityIssues();
      
      if (result.fixed > 0) {
        addToast({ type: 'success', title: `Fixed ${result.fixed} data integrity issue${result.fixed > 1 ? 's' : ''}` });
        // Refresh health check
        await performHealthCheck();
      }

      if (result.errors.length > 0) {
        addToast({ type: 'error', title: 'Some issues could not be fixed', description: result.errors.join(', ') });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to fix data integrity issues' });
    } finally {
      setIsFixingIssues(false);
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageUsagePercent = (): number => {
    if (!healthCheck || healthCheck.storageQuota === 0) return 0;
    return (healthCheck.storageUsed / healthCheck.storageQuota) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Backup Reminder
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Backup Status */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Backup Status
            </h3>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium">
                    {daysSinceLastBackup === null
                      ? "You haven't created a backup yet"
                      : `Last backup was ${daysSinceLastBackup} days ago`
                    }
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                    Regular backups protect your notes from data loss. We recommend backing up your data weekly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Health Check */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Data Health Check
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={performHealthCheck}
                disabled={isLoadingHealthCheck}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingHealthCheck ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoadingHealthCheck ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Checking data health...
              </div>
            ) : healthCheck ? (
              <div className="space-y-4">
                {/* Data Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {healthCheck.totalNotes}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Notes</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {healthCheck.totalFolders}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Folders</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {healthCheck.totalTags}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tags</div>
                  </div>
                </div>

                {/* Storage Usage */}
                {healthCheck.storageQuota > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Storage Usage
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatStorageSize(healthCheck.storageUsed)} / {formatStorageSize(healthCheck.storageQuota)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          getStorageUsagePercent() > 80
                            ? 'bg-red-500'
                            : getStorageUsagePercent() > 60
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(getStorageUsagePercent(), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Issues */}
                {healthCheck.issues.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                          Issues Found
                        </h4>
                        <ul className="space-y-1">
                          {healthCheck.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-700 dark:text-red-300">
                              • {issue}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFixIssues}
                          disabled={isFixingIssues}
                          className="mt-3 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                        >
                          {isFixingIssues ? 'Fixing...' : 'Fix Issues'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {healthCheck.recommendations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {healthCheck.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300">
                              • {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Good */}
                {healthCheck.issues.length === 0 && healthCheck.recommendations.length === 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        Your data looks healthy! No issues found.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Failed to load health check data
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                openModal('settings');
                onClose();
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisableReminders}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Disable Reminders
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRemindLater}>
              Remind Later
            </Button>
            <Button onClick={handleCreateBackup} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Create Backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};