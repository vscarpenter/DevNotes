/**
 * Note Move Modal for selecting target folder when moving notes
 * Requirements: 2.5, 6.1
 */

import React, { useState, useEffect } from 'react';
import { X, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { useFolderStore } from '../../stores/folderStore';
import { useNoteStore } from '../../stores/noteStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/toast';
import { Folder as FolderType } from '../../types/note';

interface NoteMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteIds: string[];
  currentFolderId: string;
}

interface FolderTreeItemProps {
  folder: FolderType;
  level: number;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  expandedFolders: Set<string>;
  onToggleExpanded: (folderId: string) => void;
  currentFolderId: string;
  allFolders: FolderType[];
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  level,
  selectedFolderId,
  onSelectFolder,
  expandedFolders,
  onToggleExpanded,
  currentFolderId,
  allFolders
}) => {
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const isCurrent = currentFolderId === folder.id;
  const hasChildren = folder.children.length > 0;

  const childFolders = folder.children
    .map(childId => allFolders.find(f => f.id === childId))
    .filter(Boolean) as FolderType[];

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : isCurrent
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => !isCurrent && onSelectFolder(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(folder.id);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-5" />}
        
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <Folder className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
        
        <span className={`flex-1 truncate ${isCurrent ? 'line-through' : ''}`}>
          {folder.name}
          {isCurrent && ' (current)'}
        </span>
      </div>

      {isExpanded && childFolders.length > 0 && (
        <div>
          {childFolders.map((childFolder) => (
            <FolderTreeItem
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              expandedFolders={expandedFolders}
              onToggleExpanded={onToggleExpanded}
              currentFolderId={currentFolderId}
              allFolders={allFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const NoteMoveModal: React.FC<NoteMoveModalProps> = ({
  isOpen,
  onClose,
  noteIds,
  currentFolderId
}) => {
  const { folders, loadFolders, createFolder, getRootFolders } = useFolderStore();
  const { moveNote, getNote } = useNoteStore();
  const { addToast } = useToast();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      // Expand folders to show current folder's path
      const expandPath = (folderId: string) => {
        const folder = folders[folderId];
        if (folder?.parentId) {
          setExpandedFolders(prev => new Set([...prev, folder.parentId!]));
          expandPath(folder.parentId);
        }
      };
      expandPath(currentFolderId);
    }
  }, [isOpen, loadFolders, folders, currentFolderId]);

  const handleToggleExpanded = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const parentId = selectedFolderId || null;
      await createFolder(parentId, newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      addToast({ type: 'success', title: 'Folder created successfully' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to create folder' });
    }
  };

  const handleMoveNotes = async () => {
    if (!selectedFolderId || selectedFolderId === currentFolderId) return;

    setIsMoving(true);
    try {
      // Move all selected notes
      await Promise.all(
        noteIds.map(noteId => moveNote(noteId, selectedFolderId))
      );

      const noteCount = noteIds.length;
      const targetFolder = folders[selectedFolderId];
      addToast({ 
        type: 'success', 
        title: `Moved ${noteCount} note${noteCount > 1 ? 's' : ''} to "${targetFolder?.name}"` 
      });
      onClose();
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to move notes' });
    } finally {
      setIsMoving(false);
    }
  };

  const allFolders = Object.values(folders);
  const rootFolders = getRootFolders();

  // Get note titles for display
  const noteNames = noteIds
    .map(id => getNote(id)?.title)
    .filter(Boolean)
    .slice(0, 3); // Show max 3 names

  const displayNames = noteNames.length > 0 
    ? noteNames.join(', ') + (noteIds.length > 3 ? ` and ${noteIds.length - 3} more` : '')
    : `${noteIds.length} note${noteIds.length > 1 ? 's' : ''}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Move Notes
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

        <div className="p-6">
          {/* Note info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Moving:
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {displayNames}
            </p>
          </div>

          {/* Create new folder option */}
          <div className="mb-4">
            {isCreatingFolder ? (
              <form onSubmit={handleCreateFolder} className="space-y-3">
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!newFolderName.trim()}>
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingFolder(true)}
                className="w-full"
              >
                <Folder className="w-4 h-4 mr-2" />
                Create New Folder
              </Button>
            )}
          </div>

          {/* Folder tree */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select destination folder:
            </p>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
              {rootFolders.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No folders available. Create a new folder above.
                </div>
              ) : (
                <div className="p-2">
                  {rootFolders.map((folder) => (
                    <FolderTreeItem
                      key={folder.id}
                      folder={folder}
                      level={0}
                      selectedFolderId={selectedFolderId}
                      onSelectFolder={setSelectedFolderId}
                      expandedFolders={expandedFolders}
                      onToggleExpanded={handleToggleExpanded}
                      currentFolderId={currentFolderId}
                      allFolders={allFolders}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMoveNotes}
            disabled={!selectedFolderId || selectedFolderId === currentFolderId || isMoving}
          >
            {isMoving ? 'Moving...' : 'Move Notes'}
          </Button>
        </div>
      </div>
    </div>
  );
};