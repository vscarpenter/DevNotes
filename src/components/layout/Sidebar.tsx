/**
 * Sidebar component with resizable functionality
 * Contains navigation and search functionality
 * Requirements: 1.1, 1.2, 1.3
 */

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useFolderStore } from '@/stores/folderStore';
import { useNoteStore } from '@/stores/noteStore';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Search, 
  FolderPlus, 
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui';
import { FolderTree, NoteListContainer } from '@/components/navigation';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    collapseSidebar,
    isSearchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery
  } = useUIStore();

  const { createFolder, selectedFolderId } = useFolderStore();
  const { createNote } = useNoteStore();

  const handleSearchToggle = () => {
    setSearchOpen(!isSearchOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateFolder = async () => {
    try {
      await createFolder(selectedFolderId, 'New Folder');
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const folderId = selectedFolderId || 'root';
      await createNote(folderId, 'Untitled Note');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-background border-r border-border',
      'w-full', // Take full width of parent container
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">DevNotes</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSearchToggle}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={collapseSidebar}
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                'w-full pl-10 pr-4 py-2 text-sm',
                'bg-background border border-input rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start gap-2"
            onClick={handleCreateFolder}
            title="New folder"
          >
            <FolderPlus className="h-4 w-4" />
            <span className="text-xs">Folder</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start gap-2"
            onClick={handleCreateNote}
            title="New note"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs">Note</span>
          </Button>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Folder Tree - takes up 40% of available space */}
        <div className="flex-shrink-0" style={{ height: '40%' }}>
          <FolderTree className="h-full" />
        </div>
        
        {/* Note List - takes up remaining 60% of available space */}
        <div className="flex-1 border-t border-border">
          <NoteListContainer
            folderId={selectedFolderId || undefined}
            searchQuery={searchQuery || undefined}
            height={0} // Will be calculated by the container
            className="h-full"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
};