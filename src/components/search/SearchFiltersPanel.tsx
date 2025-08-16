/**
 * SearchFiltersPanel component for search filters UI
 * Implements folder, date range, and tag filtering
 * Requirements: 5.3
 */

import React, { useState, useCallback } from 'react';
import { 
  Folder, 
  Calendar, 
  Tag, 
  X, 
  ChevronDown,
  Check
} from 'lucide-react';
import { SearchFilters } from '../../types/search';
import { useFolderStore } from '../../stores/folderStore';
import { Button, Input } from '../ui';
import { cn } from '../../lib/utils';

export interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FolderSelectorProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  selectedFolderId,
  onFolderSelect
}) => {
  const { folders, getFolder } = useFolderStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedFolder = selectedFolderId ? getFolder(selectedFolderId) : null;
  const folderList = Object.values(folders);

  const handleFolderSelect = useCallback((folderId: string | undefined) => {
    onFolderSelect(folderId);
    setIsOpen(false);
  }, [onFolderSelect]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Folder className="h-3 w-3" />
          <span className="truncate">
            {selectedFolder ? selectedFolder.name : 'All folders'}
          </span>
        </div>
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          <button
            className={cn(
              "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2",
              !selectedFolderId && "bg-accent"
            )}
            onClick={() => handleFolderSelect(undefined)}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {!selectedFolderId && <Check className="h-3 w-3" />}
            </div>
            <span>All folders</span>
          </button>
          
          {folderList.map(folder => (
            <button
              key={folder.id}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2",
                selectedFolderId === folder.id && "bg-accent"
              )}
              onClick={() => handleFolderSelect(folder.id)}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {selectedFolderId === folder.id && <Check className="h-3 w-3" />}
              </div>
              <Folder className="h-3 w-3 text-blue-500" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface DateRangeSelectorProps {
  dateRange?: { start: Date; end: Date };
  onDateRangeChange: (dateRange: { start: Date; end: Date } | undefined) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(
    dateRange?.start.toISOString().split('T')[0] || ''
  );
  const [endDate, setEndDate] = useState(
    dateRange?.end.toISOString().split('T')[0] || ''
  );

  const handleApply = useCallback(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      
      if (start <= end) {
        onDateRangeChange({ start, end });
        setIsOpen(false);
      }
    }
  }, [startDate, endDate, onDateRangeChange]);

  const handleClear = useCallback(() => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(undefined);
    setIsOpen(false);
  }, [onDateRangeChange]);

  const formatDateRange = () => {
    if (!dateRange) return 'Any time';
    
    const start = dateRange.start.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const end = dateRange.end.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    return `${start} - ${end}`;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span className="truncate">{formatDateRange()}</span>
        </div>
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 p-3">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TagSelectorProps {
  selectedTags?: string[];
  onTagsChange: (tags: string[] | undefined) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags = [],
  onTagsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // TODO: Get available tags from notes when tag system is implemented
  const availableTags: string[] = [];

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      onTagsChange(newTags.length > 0 ? newTags : undefined);
      setTagInput('');
    }
  }, [tagInput, selectedTags, onTagsChange]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags.length > 0 ? newTags : undefined);
  }, [selectedTags, onTagsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3" />
          <span className="truncate">
            {selectedTags.length > 0 
              ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''}`
              : 'Any tags'
            }
          </span>
        </div>
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 p-3 min-w-48">
          <div className="space-y-3">
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Selected tags</label>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 rounded p-0.5"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add tag input */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Add tag</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter tag name"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="h-8"
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Available tags (when implemented) */}
            {availableTags.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Available tags</label>
                <div className="max-h-24 overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded"
                      onClick={() => {
                        if (!selectedTags.includes(tag)) {
                          const newTags = [...selectedTags, tag];
                          onTagsChange(newTags);
                        }
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const hasActiveFilters = !!(
    filters.folderId ||
    filters.dateRange ||
    (filters.tags && filters.tags.length > 0)
  );

  return (
    <div className={cn("bg-muted/50 border border-border rounded-md p-3", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Search Filters</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Folder filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Folder</label>
          <FolderSelector
            selectedFolderId={filters.folderId}
            onFolderSelect={(folderId) => onFiltersChange({ folderId })}
          />
        </div>
        
        {/* Date range filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Date range</label>
          <DateRangeSelector
            dateRange={filters.dateRange}
            onDateRangeChange={(dateRange) => onFiltersChange({ dateRange })}
          />
        </div>
        
        {/* Tags filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
          <TagSelector
            selectedTags={filters.tags}
            onTagsChange={(tags) => onFiltersChange({ tags })}
          />
        </div>
      </div>
    </div>
  );
};