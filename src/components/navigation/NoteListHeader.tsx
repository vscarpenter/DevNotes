/**
 * NoteListHeader component for sorting and filtering controls
 * Requirements: 2.1, 9.6
 */

import React from 'react';
import { 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Type, 
  Hash
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface NoteListHeaderProps {
  totalCount: number;
  sortBy: 'title' | 'updatedAt' | 'createdAt' | 'wordCount';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'title' | 'updatedAt' | 'createdAt' | 'wordCount') => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  className?: string;
}

const sortOptions = [
  { value: 'updatedAt', label: 'Last Modified', icon: Calendar },
  { value: 'title', label: 'Title', icon: Type },
  { value: 'createdAt', label: 'Created', icon: Calendar },
  { value: 'wordCount', label: 'Word Count', icon: Hash },
] as const;

export const NoteListHeader: React.FC<NoteListHeaderProps> = ({
  totalCount,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  className
}) => {
  const currentSortOption = sortOptions.find(option => option.value === sortBy);
  const SortIcon = currentSortOption?.icon || Calendar;

  return (
    <div className={cn("flex items-center justify-between p-3 border-b border-border bg-background/50", className)}>
      {/* Note count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {totalCount} {totalCount === 1 ? 'note' : 'notes'}
        </span>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1">
        {/* Sort by dropdown */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
          >
            <SortIcon className="h-3 w-3 mr-1" />
            {currentSortOption?.label}
          </Button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99999]">
            {sortOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  className={cn(
                    "w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2",
                    sortBy === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onSortChange(option.value)}
                >
                  <OptionIcon className="h-3 w-3" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort order toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-3 w-3" />
          ) : (
            <SortDesc className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
};