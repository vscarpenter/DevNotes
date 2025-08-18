/**
 * NoteList component with virtual scrolling for performance
 * Displays notes with title, preview, and metadata
 * Requirements: 2.1, 9.6
 */

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FixedSizeList as List } from 'react-window';
import { 
  FileText, 
  MoreVertical, 
  Copy, 
  Trash2, 
  FolderOpen,
  Clock,
  Hash
} from 'lucide-react';
import { Note, Folder } from '../../types/note';
import { useNoteStore } from '../../stores/noteStore';
import { useFolderStore } from '../../stores/folderStore';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface NoteListProps {
  folderId?: string;
  searchQuery?: string;
  sortBy?: 'title' | 'updatedAt' | 'createdAt' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
  height: number;
  className?: string;
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (noteId: string) => void;
  onContextMenu: (note: Note, event: React.MouseEvent) => void;
}

// Individual note item component
const NoteItem: React.FC<NoteItemProps> = ({ 
  note, 
  isSelected, 
  onSelect, 
  onContextMenu 
}) => {
  const { getFolder } = useFolderStore();
  const folder = getFolder(note.folderId);
  
  // Generate preview text from content
  const previewText = useMemo(() => {
    const plainText = note.content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
    
    return plainText.length > 60 ? `${plainText.slice(0, 60)}...` : plainText;
  }, [note.content]);

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/50",
        isSelected && "bg-accent border-accent-foreground/20"
      )}
      onClick={() => onSelect(note.id)}
      onContextMenu={(e) => onContextMenu(note, e)}
    >
      {/* Note icon */}
      <div className="flex-shrink-0 mt-1">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {/* Note content */}
      <div className="flex-1 min-w-0">
        {/* Title and metadata row */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className={cn(
            "font-medium text-sm truncate",
            isSelected ? "text-accent-foreground" : "text-foreground"
          )}>
            {note.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span>{formatDate(note.updatedAt)}</span>
          </div>
        </div>
        
        {/* Preview text */}
        {previewText && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2 overflow-hidden">
            {previewText}
          </p>
        )}
        
        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Folder name */}
            <div className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              <span className="truncate max-w-20">{folder?.name || 'Unknown'}</span>
            </div>
            
            {/* Word count */}
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>{note.wordCount} words</span>
            </div>
          </div>
          
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                {note.tags[0]}
              </span>
              {note.tags.length > 1 && (
                <span className="text-xs">+{note.tags.length - 1}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Context menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(note, e);
        }}
      >
        <MoreVertical className="h-3 w-3" />
      </Button>
    </div>
  );
};

// Context menu component
interface ContextMenuProps {
  note: Note;
  position: { x: number; y: number };
  onClose: () => void;
  onDuplicate: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onMove: (noteId: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  note,
  position,
  onClose,
  onDuplicate,
  onDelete,
  onMove
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[99999] bg-popover border border-border rounded-md shadow-lg py-1 min-w-32"
      style={{ left: position.x, top: position.y }}
    >
      <button
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
        onClick={() => {
          onDuplicate(note.id);
          onClose();
        }}
      >
        <Copy className="h-3 w-3" />
        Duplicate
      </button>
      
      <button
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
        onClick={() => {
          onMove(note.id);
          onClose();
        }}
      >
        <FolderOpen className="h-3 w-3" />
        Move to...
      </button>
      
      <hr className="my-1 border-border" />
      
      <button
        className="w-full px-3 py-1.5 text-sm text-left hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
        onClick={() => {
          onDelete(note.id);
          onClose();
        }}
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>
    </div>
  );

  return createPortal(menuContent, document.body);
};

// Move Note Modal component
interface MoveNoteModalProps {
  noteTitle: string;
  currentFolderId: string;
  onMove: (folderId: string) => void;
  onClose: () => void;
}

const MoveNoteModal: React.FC<MoveNoteModalProps> = ({
  noteTitle,
  currentFolderId,
  onMove,
  onClose
}) => {
  const { folders } = useFolderStore();
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleMove = () => {
    onMove(selectedFolderId);
  };

  const folderList = Object.values(folders).filter(folder => folder.id !== currentFolderId);

  return (
    <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Move Note</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Move "{noteTitle}" to a different folder:
        </p>
        
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {folderList.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No other folders available</p>
          ) : (
            folderList.map(folder => (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                  selectedFolderId === folder.id 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <FolderOpen className="h-4 w-4" />
                <span className="text-sm">{folder.name}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleMove}
            disabled={selectedFolderId === currentFolderId || folderList.length === 0}
          >
            Move Note
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main NoteList component
export const NoteList: React.FC<NoteListProps> = ({
  folderId,
  searchQuery,
  sortBy = 'updatedAt',
  sortOrder = 'desc',
  height,
  className
}) => {
  const { 
    notes, 
    selectedNoteId, 
    selectNote, 
    duplicateNote, 
    deleteNote,
    moveNote 
  } = useNoteStore();
  
  const [contextMenu, setContextMenu] = useState<{
    note: Note;
    position: { x: number; y: number };
  } | null>(null);
  
  const [moveModal, setMoveModal] = useState<{
    noteId: string;
    noteTitle: string;
  } | null>(null);

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let noteList = Object.values(notes);
    
    // Filter by folder if specified
    if (folderId) {
      noteList = noteList.filter(note => note.folderId === folderId);
    }
    
    // Filter by search query if specified
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      noteList = noteList.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Sort notes
    noteList.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
        case 'updatedAt':
        default:
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return noteList;
  }, [notes, folderId, searchQuery, sortBy, sortOrder]);

  // Handle note selection
  const handleNoteSelect = useCallback((noteId: string) => {
    selectNote(noteId);
  }, [selectNote]);

  // Handle context menu
  const handleContextMenu = useCallback((note: Note, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      note,
      position: { x: event.clientX, y: event.clientY }
    });
  }, []);

  // Handle context menu actions
  const handleDuplicate = useCallback(async (noteId: string) => {
    try {
      await duplicateNote(noteId);
    } catch (error) {
      console.error('Failed to duplicate note:', error);
    }
  }, [duplicateNote]);

  const handleDelete = useCallback(async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  }, [deleteNote]);

  const handleMove = useCallback((noteId: string) => {
    const note = notes[noteId];
    if (note) {
      setMoveModal({
        noteId,
        noteTitle: note.title
      });
    }
  }, [notes]);

  const handleMoveConfirm = useCallback(async (targetFolderId: string) => {
    if (!moveModal) return;
    
    try {
      await moveNote(moveModal.noteId, targetFolderId);
      setMoveModal(null);
    } catch (error) {
      console.error('Failed to move note:', error);
    }
  }, [moveNote, moveModal]);

  // Virtual list row renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const note = filteredAndSortedNotes[index];
    const isSelected = selectedNoteId === note.id;
    
    return (
      <div style={style} className="group">
        <NoteItem
          note={note}
          isSelected={isSelected}
          onSelect={handleNoteSelect}
          onContextMenu={handleContextMenu}
        />
      </div>
    );
  }, [filteredAndSortedNotes, selectedNoteId, handleNoteSelect, handleContextMenu]);

  // Empty state
  if (filteredAndSortedNotes.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-center p-6", className)}>
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {searchQuery ? 'No notes found' : 'No notes yet'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {searchQuery 
            ? `No notes match "${searchQuery}". Try a different search term.`
            : 'Create your first note to get started with DevNotes.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Virtual scrolling list */}
      <List
        height={height}
        itemCount={filteredAndSortedNotes.length}
        itemSize={100} // Increased height to prevent overlapping
        width="100%"
      >
        {Row}
      </List>
      
      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          note={contextMenu.note}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      )}
      
      {/* Move note modal */}
      {moveModal && (
        <MoveNoteModal
          noteTitle={moveModal.noteTitle}
          currentFolderId={notes[moveModal.noteId]?.folderId || ''}
          onMove={handleMoveConfirm}
          onClose={() => setMoveModal(null)}
        />
      )}
    </div>
  );
};