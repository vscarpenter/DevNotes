/**
 * FolderTree component with hierarchical display
 * Implements expand/collapse functionality with state persistence
 * Requirements: 3.5, 3.6, 1.4
 */

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFolderStore } from '@/stores/folderStore';
import { useNoteStore } from '@/stores/noteStore';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useDragAndDrop } from '@/hooks/useDragDrop';
import { DragData } from '@/types/dragdrop';

interface FolderTreeProps {
  className?: string;
  onFolderSelect?: (folderId: string | null) => void;
}

interface FolderTreeItemProps {
  folderId: string;
  level: number;
  onContextMenu?: (folderId: string, event: React.MouseEvent) => void;
}

interface ContextMenuProps {
  folderId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onCreateFolder: (parentId: string) => void;
  onRename: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  folderId,
  position,
  onClose,
  onCreateFolder,
  onRename,
  onDelete
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[99999] min-w-[160px] bg-popover border border-border rounded-md shadow-lg py-1"
      style={{ left: position.x, top: position.y }}
    >
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
        onClick={() => {
          onCreateFolder(folderId);
          onClose();
        }}
      >
        <FolderPlus className="h-4 w-4" />
        New Folder
      </button>
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
        onClick={() => {
          onRename(folderId);
          onClose();
        }}
      >
        <Edit2 className="h-4 w-4" />
        Rename
      </button>
      <div className="border-t border-border my-1" />
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
        onClick={() => {
          onDelete(folderId);
          onClose();
        }}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  );

  return createPortal(menuContent, document.body);
};

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folderId,
  level,
  onContextMenu
}) => {
  const {
    getFolder,
    getChildFolders,
    isFolderExpanded,
    toggleFolderExpansion,
    selectedFolderId,
    selectFolder,
    moveFolder
  } = useFolderStore();

  const { getNotesByFolder, moveNote } = useNoteStore();

  const folder = getFolder(folderId);
  const childFolders = getChildFolders(folderId);
  const notes = getNotesByFolder(folderId);
  const isExpanded = isFolderExpanded(folderId);
  const isSelected = selectedFolderId === folderId;
  const hasChildren = childFolders.length > 0;
  const hasNotes = notes.length > 0;

  // Drag and drop functionality
  const { isDragging, isOver, canDrop, combinedProps } = useDragAndDrop(
    {
      type: 'folder',
      id: folderId,
      data: folder
    },
    {
      id: folderId,
      type: 'folder',
      acceptedTypes: ['folder', 'note'],
      canDrop: (dragData: DragData) => {
        // Don't allow dropping on itself
        if (dragData.id === folderId) return false;

        // For folders, prevent dropping parent into child
        if (dragData.type === 'folder') {
          let currentParent = folder?.parentId;
          while (currentParent) {
            if (currentParent === dragData.id) return false;
            const parentFolder = getFolder(currentParent);
            currentParent = parentFolder?.parentId || null;
          }
        }

        return true;
      },
      onDrop: async (dragData: DragData) => {
        try {
          if (dragData.type === 'folder') {
            // Move folder into this folder
            await moveFolder(dragData.id, folderId);
          } else if (dragData.type === 'note') {
            // Move note into this folder
            await moveNote(dragData.id, folderId);
          }
        } catch (error) {
          console.error('Drop operation failed:', error);
        }
      }
    }
  );

  if (!folder) return null;

  const handleToggleExpansion = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleFolderExpansion(folderId);
    }
  }, [folderId, hasChildren, toggleFolderExpansion]);

  const handleSelect = useCallback(() => {
    selectFolder(folderId);
  }, [folderId, selectFolder]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(folderId, e);
  }, [folderId, onContextMenu]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleFolderExpansion(folderId);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (hasChildren && isExpanded) {
          toggleFolderExpansion(folderId);
        }
        break;
    }
  }, [handleSelect, hasChildren, isExpanded, folderId, toggleFolderExpansion]);

  return (
    <div>
      <div
        {...combinedProps}
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer group',
          'hover:bg-accent transition-all duration-200',
          isSelected && 'bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          isDragging && 'opacity-50 cursor-grabbing',
          isOver && canDrop && 'bg-dark-teal/20 border-l-2 border-l-dark-teal shadow-elevation-2',
          isOver && !canDrop && 'bg-destructive/10 border-l-2 border-l-destructive'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={level + 1}
        aria-label={`${folder.name} folder${isDragging ? ' (dragging)' : ''}${isOver && canDrop ? ' (drop here)' : ''}`}
      >
        {/* Expand/collapse button */}
        <button
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded hover:bg-accent-foreground/10',
            !hasChildren && 'invisible'
          )}
          onClick={handleToggleExpansion}
          tabIndex={-1}
          aria-hidden={!hasChildren}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          )}
        </button>

        {/* Folder icon */}
        <div className="flex items-center justify-center w-4 h-4">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Folder name */}
        <span className="flex-1 text-sm truncate">
          {folder.name}
        </span>

        {/* Visual indicators */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasNotes && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{notes.length}</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu?.(folderId, e);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Child folders */}
      {hasChildren && isExpanded && (
        <div role="group">
          {childFolders.map(childFolder => (
            <FolderTreeItem
              key={childFolder.id}
              folderId={childFolder.id}
              level={level + 1}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  className
}) => {
  const { 
    getRootFolders, 
    loadFolders, 
    createFolder, 
    updateFolder, 
    deleteFolder,
    isLoading, 
    error 
  } = useFolderStore();

  const [contextMenu, setContextMenu] = useState<{
    folderId: string;
    position: { x: number; y: number };
  } | null>(null);

  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const rootFolders = getRootFolders();

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleContextMenu = useCallback((folderId: string, event: React.MouseEvent) => {
    setContextMenu({
      folderId,
      position: { x: event.clientX, y: event.clientY }
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleCreateFolder = useCallback(async (parentId: string) => {
    try {
      const actualParentId = parentId === 'root' ? null : parentId;
      const newFolderId = await createFolder(actualParentId, 'New Folder');
      setEditingFolder(newFolderId);
      setEditingName('New Folder');
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  }, [createFolder]);

  const handleRename = useCallback((folderId: string) => {
    const folder = useFolderStore.getState().getFolder(folderId);
    if (folder) {
      setEditingFolder(folderId);
      setEditingName(folder.name);
    }
  }, []);

  const handleDelete = useCallback(async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder and all its contents?')) {
      try {
        await deleteFolder(folderId);
      } catch (error) {
        console.error('Failed to delete folder:', error);
      }
    }
  }, [deleteFolder]);

  const handleSaveEdit = useCallback(async () => {
    if (editingFolder && editingName.trim()) {
      try {
        await updateFolder(editingFolder, { name: editingName.trim() });
        setEditingFolder(null);
        setEditingName('');
      } catch (error) {
        console.error('Failed to update folder:', error);
      }
    }
  }, [editingFolder, editingName, updateFolder]);

  const handleCancelEdit = useCallback(() => {
    setEditingFolder(null);
    setEditingName('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingFolder) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    }
  }, [editingFolder, handleSaveEdit, handleCancelEdit]);

  if (error) {
    return (
      <div className={cn('p-4', className)}>
        <div className="text-sm text-destructive">
          Error loading folders: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        <h3 className="text-sm font-medium">Folders</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleCreateFolder('root')}
          title="Create root folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tree content */}
      <div className="overflow-y-auto" role="tree" aria-label="Folder tree">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading folders...
          </div>
        ) : rootFolders.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No folders yet. Create your first folder to get started.
          </div>
        ) : (
          <div className="py-2">
            {rootFolders.map(folder => (
              <FolderTreeItem
                key={folder.id}
                folderId={folder.id}
                level={0}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          folderId={contextMenu.folderId}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          onCreateFolder={handleCreateFolder}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}

      {/* Inline editing overlay */}
      {editingFolder && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50">
          <div className="bg-popover border border-border rounded-md p-4 min-w-[300px]">
            <h4 className="text-sm font-medium mb-2">Rename Folder</h4>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};