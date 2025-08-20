/**
 * Main panel component for editor area
 * Provides the main content area with responsive behavior and editor integration
 * Requirements: 1.1, 1.2, 4.1
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useNoteStore } from '@/stores/noteStore';
import { useFolderStore } from '@/stores/folderStore';
import { useUserGuideStore } from '@/stores/userGuideStore';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  FileText, 
  Eye, 
  Edit3,
  MoreHorizontal,
  Save,
  Clock,
  Hash,
  HelpCircle
} from 'lucide-react';
import { Button, Logo } from '@/components/ui';
import { SplitView } from '@/components/editor/SplitView';

interface EditableNoteTitleProps {
  noteId: string;
  title: string;
  onUpdate: (newTitle: string) => void;
}

const EditableNoteTitle: React.FC<EditableNoteTitleProps> = ({ noteId, title, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleSubmit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onUpdate(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleSubmit();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, editValue]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="font-medium text-foreground bg-transparent border-none outline-none min-w-0 flex-1 text-sm"
        placeholder="Note title..."
      />
    );
  }

  return (
    <div 
      className="font-medium text-foreground truncate cursor-pointer hover:bg-accent/50 px-1 py-0.5 rounded transition-colors"
      onDoubleClick={handleDoubleClick}
      title="Double-click to edit title"
    >
      {title}
    </div>
  );
};

interface MainPanelProps {
  children?: React.ReactNode;
  className?: string;
}

export const MainPanel: React.FC<MainPanelProps> = ({ children, className }) => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isPreviewMode,
    togglePreviewMode,
    saveStatus,
    panelLayout,
    cursorPosition,
    selectionInfo
  } = useUIStore();

  const noteStore = useNoteStore();
  const folderStore = useFolderStore();
  const userGuideStore = useUserGuideStore();
  
  const { selectedNoteId, getNote, updateNote } = noteStore || {};
  const { getFolder } = folderStore || {};
  const { openGuide } = userGuideStore || {};

  // Get current note and folder information
  const currentNote = selectedNoteId && getNote ? getNote(selectedNoteId) : null;
  const currentFolder = currentNote && getFolder ? getFolder(currentNote.folderId) : null;

  // Calculate word count and reading time
  const wordCount = useMemo(() => {
    if (!currentNote?.content) return 0;
    return currentNote.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [currentNote?.content]);

  const readingTime = useMemo(() => {
    // Average reading speed: 200 words per minute
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'saved':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'unsaved':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      case 'unsaved':
        return 'Unsaved changes';
      default:
        return '';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header/Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden flex-shrink-0"
            onClick={toggleSidebar}
            title="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden md:flex flex-shrink-0"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Current note information */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0">
              {currentNote ? (
                <EditableNoteTitle 
                  noteId={currentNote.id}
                  title={currentNote.title}
                  onUpdate={(newTitle) => updateNote?.(currentNote.id, { title: newTitle })}
                />
              ) : (
                <div className="font-medium text-foreground truncate">
                  No note selected
                </div>
              )}
              {currentNote && currentFolder && (
                <div className="text-xs text-muted-foreground truncate">
                  in {currentFolder.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Note metadata */}
          {currentNote && (
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground mr-2">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Modified {formatDate(currentNote.updatedAt)}</span>
              </div>
            </div>
          )}

          {/* Save status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getSaveStatusIcon()}
            <span className="hidden sm:inline">{getSaveStatusText()}</span>
          </div>

          {/* View mode toggle - only show when note is selected */}
          {currentNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePreviewMode}
              className="gap-2"
              title={isPreviewMode ? 'Switch to edit mode' : 'Switch to preview mode'}
            >
              {isPreviewMode ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </>
              )}
            </Button>
          )}

          {/* Help button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => openGuide()}
            title="Open user guide"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* More options */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {currentNote ? (
          <SplitView noteId={currentNote.id} className="h-full" />
        ) : children ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="flex justify-center mb-6">
                <Logo size="lg" variant="full" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to DevNotes</h2>
              <p className="text-muted-foreground mb-6">
                A developer-focused note-taking application with markdown support, 
                code highlighting, and hierarchical organization.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Create folders to organize your notes</p>
                <p>• Write in markdown with live preview</p>
                <p>• Search across all your content</p>
                <p>• Everything is stored locally in your browser</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{currentNote ? 'Ready' : 'No note selected'}</span>
          {panelLayout !== 'split' && (
            <span>Layout: {panelLayout}</span>
          )}
          {currentNote && (
            <span>
              {currentNote.tags && currentNote.tags.length > 0 
                ? `Tags: ${currentNote.tags.join(', ')}` 
                : 'No tags'
              }
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          {currentNote && (
            <>
              <span>{readingTime} min read</span>
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
              {selectionInfo.hasSelection && (
                <span>({selectionInfo.selectedLength} selected)</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};