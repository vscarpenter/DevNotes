/**
 * Keyboard Shortcuts Help Modal
 * Requirements: 4.4, 10.1, 10.2
 */

import React, { useState } from 'react';
import { X, Search, Edit, FileText, Folder, Settings, Download, Command } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string[];
  description: string;
  category?: string;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: 'general',
    title: 'General',
    icon: <Command className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'N'], description: 'Create new note' },
      { keys: ['Ctrl', 'S'], description: 'Save current note (force save)' },
      { keys: ['Ctrl', 'K'], description: 'Open search' },
      { keys: ['Ctrl', 'Shift', 'P'], description: 'Open command palette' },
      { keys: ['Ctrl', ','], description: 'Open settings' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Export notes' },
      { keys: ['Ctrl', 'Shift', 'I'], description: 'Import notes' },
      { keys: ['F1'], description: 'Show keyboard shortcuts' },
      { keys: ['Escape'], description: 'Close modal or cancel action' }
    ]
  },
  {
    id: 'navigation',
    title: 'Navigation',
    icon: <Folder className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', '1'], description: 'Focus sidebar' },
      { keys: ['Ctrl', '2'], description: 'Focus editor' },
      { keys: ['Ctrl', '3'], description: 'Focus preview' },
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', 'Shift', 'B'], description: 'Toggle preview' },
      { keys: ['↑', '↓'], description: 'Navigate notes list' },
      { keys: ['Enter'], description: 'Open selected note' },
      { keys: ['Tab'], description: 'Navigate between UI elements' },
      { keys: ['Shift', 'Tab'], description: 'Navigate backwards' }
    ]
  },
  {
    id: 'editor',
    title: 'Editor',
    icon: <Edit className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Bold text' },
      { keys: ['Ctrl', 'I'], description: 'Italic text' },
      { keys: ['Ctrl', 'U'], description: 'Underline text' },
      { keys: ['Ctrl', 'Shift', 'X'], description: 'Strikethrough text' },
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Inline code' },
      { keys: ['Ctrl', 'Shift', 'K'], description: 'Code block' },
      { keys: ['Ctrl', 'L'], description: 'Insert link' },
      { keys: ['Ctrl', 'Shift', 'L'], description: 'Insert list' },
      { keys: ['Ctrl', 'Shift', 'O'], description: 'Insert ordered list' },
      { keys: ['Ctrl', 'Shift', 'Q'], description: 'Insert blockquote' },
      { keys: ['Ctrl', 'Shift', 'H'], description: 'Insert heading' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Insert table' },
      { keys: ['Ctrl', 'Shift', 'M'], description: 'Insert math expression' },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Insert diagram' }
    ]
  },
  {
    id: 'search',
    title: 'Search',
    icon: <Search className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'F'], description: 'Find in current note' },
      { keys: ['Ctrl', 'H'], description: 'Find and replace' },
      { keys: ['F3'], description: 'Find next' },
      { keys: ['Shift', 'F3'], description: 'Find previous' },
      { keys: ['Ctrl', 'G'], description: 'Go to line' },
      { keys: ['Ctrl', 'Shift', 'F'], description: 'Search in all notes' },
      { keys: ['Ctrl', 'Shift', 'R'], description: 'Recent notes' }
    ]
  },
  {
    id: 'notes',
    title: 'Note Management',
    icon: <FileText className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'D'], description: 'Duplicate note' },
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Delete note' },
      { keys: ['Ctrl', 'M'], description: 'Move note to folder' },
      { keys: ['Ctrl', 'R'], description: 'Rename note' },
      { keys: ['Ctrl', 'T'], description: 'Add tag to note' },
      { keys: ['Ctrl', 'Shift', 'T'], description: 'Manage tags' },
      { keys: ['Ctrl', 'E'], description: 'Export current note' }
    ]
  }
];

const KeyboardKey: React.FC<{ keyName: string }> = ({ keyName }) => {
  const getKeyDisplay = (key: string) => {
    const keyMap: Record<string, string> = {
      'Ctrl': '⌘',
      'Shift': '⇧',
      'Alt': '⌥',
      'Enter': '↵',
      'Escape': 'Esc',
      'Backspace': '⌫',
      'Delete': '⌦',
      'Tab': '⇥',
      'Space': '␣',
      '↑': '↑',
      '↓': '↓',
      '←': '←',
      '→': '→'
    };

    // Use Mac symbols on Mac, Windows symbols elsewhere
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (isMac && keyMap[key]) {
      return keyMap[key];
    }

    return key;
  };

  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
      {getKeyDisplay(keyName)}
    </kbd>
  );
};

const ShortcutItem: React.FC<{ shortcut: Shortcut }> = ({ shortcut }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
        {shortcut.description}
      </span>
      <div className="flex items-center gap-1 ml-4">
        {shortcut.keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 mx-1">+</span>
            )}
            <KeyboardKey keyName={key} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('general');

  const filteredGroups = SHORTCUT_GROUPS.map(group => ({
    ...group,
    shortcuts: group.shortcuts.filter(shortcut =>
      searchQuery === '' ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(group => group.shortcuts.length > 0);

  const activeGroupData = filteredGroups.find(group => group.id === activeGroup) || filteredGroups[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Command className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
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

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex h-[calc(80vh-200px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3',
                    activeGroup === group.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {group.icon}
                  <span className="font-medium text-sm">{group.title}</span>
                  <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                    {group.shortcuts.length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeGroupData ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {activeGroupData.icon}
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {activeGroupData.title}
                  </h3>
                </div>

                <div className="space-y-1">
                  {activeGroupData.shortcuts.map((shortcut, index) => (
                    <ShortcutItem key={index} shortcut={shortcut} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No shortcuts found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Press <KeyboardKey keyName="F1" /> anytime to open this help
          </div>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};