/**
 * RecentNotesSection component for displaying recently accessed notes
 * Requirements: 5.4
 */

import React from 'react';
import { Clock, FileText, Folder } from 'lucide-react';
import { useNoteStore } from '../../stores/noteStore';
import { useFolderStore } from '../../stores/folderStore';
import { cn } from '../../lib/utils';

export interface RecentNotesSectionProps {
  recentNotes: string[];
  onNoteSelect: (noteId: string) => void;
  className?: string;
}

export const RecentNotesSection: React.FC<RecentNotesSectionProps> = ({
  recentNotes,
  onNoteSelect,
  className
}) => {
  const { getNote } = useNoteStore();
  const { getFolder } = useFolderStore();

  // Filter out notes that no longer exist
  const validRecentNotes = recentNotes
    .map(noteId => getNote(noteId))
    .filter(note => note !== undefined);

  if (validRecentNotes.length === 0) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-medium text-foreground mb-1">No recent notes</h3>
        <p className="text-xs text-muted-foreground">
          Your recently accessed notes will appear here.
        </p>
      </div>
    );
  }

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

  return (
    <div className={cn("bg-popover border border-border rounded-md shadow-lg", className)}>
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="h-4 w-4" />
          Recent Notes
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {validRecentNotes.map((note, index) => {
          const folder = getFolder(note.folderId);
          
          // Generate preview text from content
          const previewText = note.content
            .replace(/#{1,6}\s+/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .trim();
          
          const truncatedPreview = previewText.length > 60 
            ? `${previewText.slice(0, 60)}...` 
            : previewText;

          return (
            <button
              key={note.id}
              className="w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-accent transition-colors focus:outline-none focus:bg-accent"
              onClick={() => onNoteSelect(note.id)}
            >
              <div className="flex items-start gap-3">
                {/* Note icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                    {note.title}
                  </h3>
                  
                  {/* Preview */}
                  {truncatedPreview && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {truncatedPreview}
                    </p>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      <span className="truncate max-w-24">{folder?.name || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};