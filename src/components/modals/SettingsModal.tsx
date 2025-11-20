/**
 * Settings Modal for application preferences and configuration
 * Requirements: 10.1, 10.2, 7.2
 */

import React, { useState, useEffect } from 'react';
import { X, Monitor, Sun, Moon, Save, RotateCcw } from 'lucide-react';
import { useUIStore, Theme } from '../../stores/uiStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  description: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of the application'
  },
  {
    id: 'editor',
    title: 'Editor',
    description: 'Configure editor behavior and preferences'
  },
  {
    id: 'autosave',
    title: 'Auto-save',
    description: 'Configure automatic saving behavior'
  },
  {
    id: 'data',
    title: 'Data & Storage',
    description: 'Manage your data and storage preferences'
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    theme,
    sidebarWidth,
    showLineNumbers,
    wordWrap,
    fontSize,
    setTheme,
    setSidebarWidth,
    toggleLineNumbers,
    toggleWordWrap,
    setFontSize
  } = useUIStore();

  const { addToast } = useToast();

  const [activeSection, setActiveSection] = useState('appearance');
  const [localSettings, setLocalSettings] = useState({
    theme,
    sidebarWidth,
    showLineNumbers,
    wordWrap,
    fontSize,
    autoSaveDelay: 500,
    backupReminder: true,
    backupReminderDays: 7
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset local settings when modal opens
      setLocalSettings({
        theme,
        sidebarWidth,
        showLineNumbers,
        wordWrap,
        fontSize,
        autoSaveDelay: 500,
        backupReminder: true,
        backupReminderDays: 7
      });
      setHasChanges(false);
    }
  }, [isOpen, theme, sidebarWidth, showLineNumbers, wordWrap, fontSize]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    try {
      // Apply theme changes
      if (localSettings.theme !== theme) {
        setTheme(localSettings.theme);
      }

      // Apply sidebar width changes
      if (localSettings.sidebarWidth !== sidebarWidth) {
        setSidebarWidth(localSettings.sidebarWidth);
      }

      // Apply editor changes
      if (localSettings.showLineNumbers !== showLineNumbers) {
        toggleLineNumbers();
      }

      if (localSettings.wordWrap !== wordWrap) {
        toggleWordWrap();
      }

      if (localSettings.fontSize !== fontSize) {
        setFontSize(localSettings.fontSize);
      }

      // Save other settings to localStorage
      localStorage.setItem('devnotes-settings', JSON.stringify({
        autoSaveDelay: localSettings.autoSaveDelay,
        backupReminder: localSettings.backupReminder,
        backupReminderDays: localSettings.backupReminderDays
      }));

      setHasChanges(false);
      addToast({ type: 'success', title: 'Settings saved successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to save settings' });
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaults = {
        theme: 'system' as Theme,
        sidebarWidth: 300,
        showLineNumbers: true,
        wordWrap: true,
        fontSize: 14,
        autoSaveDelay: 500,
        backupReminder: true,
        backupReminderDays: 7
      };

      setLocalSettings(defaults);
      setHasChanges(true);
    }
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('theme', value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                localSettings.theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sidebar Width: {localSettings.sidebarWidth}px
        </label>
        <input
          type="range"
          min="250"
          max="500"
          step="10"
          value={localSettings.sidebarWidth}
          onChange={(e) => handleSettingChange('sidebarWidth', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>250px</span>
          <span>500px</span>
        </div>
      </div>
    </div>
  );

  const renderEditorSettings = () => (
    <div className="space-y-6">
      {/* Line Numbers */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Line Numbers
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Display line numbers in the editor
          </p>
        </div>
        <button
          onClick={() => handleSettingChange('showLineNumbers', !localSettings.showLineNumbers)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.showLineNumbers ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.showLineNumbers ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Word Wrap */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Word Wrap
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Wrap long lines in the editor
          </p>
        </div>
        <button
          onClick={() => handleSettingChange('wordWrap', !localSettings.wordWrap)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.wordWrap ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.wordWrap ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Size: {localSettings.fontSize}px
        </label>
        <input
          type="range"
          min="10"
          max="24"
          step="1"
          value={localSettings.fontSize}
          onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>10px</span>
          <span>24px</span>
        </div>
      </div>
    </div>
  );

  const renderAutoSaveSettings = () => (
    <div className="space-y-6">
      {/* Auto-save Delay */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Auto-save Delay
        </label>
        <select
          value={localSettings.autoSaveDelay}
          onChange={(e) => handleSettingChange('autoSaveDelay', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value={250}>250ms (Very Fast)</option>
          <option value={500}>500ms (Fast)</option>
          <option value={1000}>1 second (Normal)</option>
          <option value={2000}>2 seconds (Slow)</option>
          <option value={5000}>5 seconds (Very Slow)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          How long to wait after typing stops before auto-saving
        </p>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      {/* Backup Reminders */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Backup Reminders
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Show reminders to backup your data
          </p>
        </div>
        <button
          onClick={() => handleSettingChange('backupReminder', !localSettings.backupReminder)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.backupReminder ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.backupReminder ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Backup Reminder Frequency */}
      {localSettings.backupReminder && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reminder Frequency
          </label>
          <select
            value={localSettings.backupReminderDays}
            onChange={(e) => handleSettingChange('backupReminderDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={1}>Daily</option>
            <option value={3}>Every 3 days</option>
            <option value={7}>Weekly</option>
            <option value={14}>Every 2 weeks</option>
            <option value={30}>Monthly</option>
          </select>
        </div>
      )}

      {/* Storage Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Storage Information
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          All data is stored locally in your browser using IndexedDB. No data is sent to external servers.
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-modal rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[calc(80vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {SETTINGS_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{section.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {section.description}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.title}
              </h3>

              {activeSection === 'appearance' && renderAppearanceSettings()}
              {activeSection === 'editor' && renderEditorSettings()}
              {activeSection === 'autosave' && renderAutoSaveSettings()}
              {activeSection === 'data' && renderDataSettings()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};