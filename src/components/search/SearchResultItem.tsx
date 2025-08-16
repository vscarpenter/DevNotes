/**
 * SearchResultItem component for displaying individual search results
 * Implements highlighting and result metadata display
 * Requirements: 5.2, 5.6
 */

import React, { useMemo, useCallback } from 'react';
import { FileText, Folder, Clock, Hash } from 'lucide-react';
import { SearchResult } from '../../types/search';
import { useNoteStore } from '../../stores/noteStore';
import { useFolderStore } from '../../stores/folderStore';
import { cn } from '../../lib/utils';

export interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  query: string;
  id?: string;
  className?: string;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  isSelected,
  onClick,
  query,
  id,
  className
}) => {
  const { getNote } = useNoteStore();
  const { getFolder } = useFolderStore();
  
  const note = getNote(result.noteId);
  const folder = getFolder(note?.folderId || '');

  // Highlight matching text in title and snippet
  const highlightText = useCallback((text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark 
            key={index} 
            className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded px-0.5"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  }, []);

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get highlighted title
  const highlightedTitle = useMemo(() => {
    return highlightText(result.title, query);
  }, [result.title, query, highlightText]);

  // Get highlighted snippet
  const highlightedSnippet = useMemo(() => {
    return highlightText(result.snippet, query);
  }, [result.snippet, query, highlightText]);

  if (!note) {
    return null;
  }

  return (
    <button
      id={id}
      className={cn(
        "w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-accent transition-colors focus:outline-none focus:bg-accent",
        isSelected && "bg-accent",
        className
      )}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start gap-3">
        {/* Note icon */}
        <div className="flex-shrink-0 mt-0.5">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with highlighting */}
          <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
            {highlightedTitle}
          </h3>
          
          {/* Snippet with highlighting */}
          {result.snippet && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {highlightedSnippet}
            </p>
          )}
          
          {/* Metadata row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {/* Folder path */}
              <div className="flex items-center gap-1">
                <Folder className="h-3 w-3" />
                <span className="truncate max-w-32">{result.folderPath}</span>
              </div>
              
              {/* Word count */}
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>{note.wordCount} words</span>
              </div>
            </div>
            
            {/* Last modified and match count */}
            <div className="flex items-center gap-3">
              {/* Match count */}
              {result.matchCount > 0 && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                  {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
                </span>
              )}
              
              {/* Last modified */}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(result.lastModified)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};