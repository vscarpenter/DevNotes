/**
 * NoteListContainer component that combines header and list with state management
 * Requirements: 2.1, 9.6
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNoteStore } from '../../stores/noteStore';
import { NoteList } from './NoteList';
import { NoteListHeader } from './NoteListHeader';
import { cn } from '../../lib/utils';

export interface NoteListContainerProps {
  folderId?: string;
  searchQuery?: string;
  height: number;
  className?: string;
}

export const NoteListContainer: React.FC<NoteListContainerProps> = ({
  folderId,
  searchQuery,
  height,
  className
}) => {
  const { notes } = useNoteStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(height || 400);
  
  // Local state for sorting
  const [sortBy, setSortBy] = useState<'title' | 'updatedAt' | 'createdAt' | 'wordCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate container height dynamically if height is 0 or not provided
  useEffect(() => {
    if (height === 0 && containerRef.current) {
      const updateHeight = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerHeight(rect.height);
        }
      };

      updateHeight();
      
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(containerRef.current);
      
      return () => resizeObserver.disconnect();
    } else if (height > 0) {
      setContainerHeight(height);
    }
  }, [height]);

  // Calculate filtered note count for header
  const filteredNoteCount = useMemo(() => {
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
    
    return noteList.length;
  }, [notes, folderId, searchQuery]);

  const headerHeight = 49; // Height of the header component
  const listHeight = Math.max(200, containerHeight - headerHeight);

  return (
    <div ref={containerRef} className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Header with sorting controls */}
      <NoteListHeader
        totalCount={filteredNoteCount}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />
      
      {/* Note list with virtual scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <NoteList
          folderId={folderId}
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          height={listHeight}
        />
      </div>
    </div>
  );
};