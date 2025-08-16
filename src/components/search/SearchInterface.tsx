/**
 * SearchInterface component with input and results
 * Implements search result display with highlighting and keyboard navigation
 * Requirements: 5.1, 5.2, 5.3, 5.6
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Clock, 
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Folder,
  Calendar,
  Tag
} from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { useNoteStore } from '../../stores/noteStore';
import { useFolderStore } from '../../stores/folderStore';
import { SearchResult, SearchFilters } from '../../types/search';
import { Button, Input } from '../ui';
import { cn } from '../../lib/utils';
import { SearchResultItem } from './SearchResultItem';
import { SearchFiltersPanel } from './SearchFiltersPanel';
import { RecentNotesSection } from './RecentNotesSection';

export interface SearchInterfaceProps {
  className?: string;
  onResultSelect?: (noteId: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  className,
  onResultSelect,
  onClose,
  autoFocus = true
}) => {
  const {
    query,
    results,
    filters,
    isSearching,
    recentQueries,
    recentNotes,
    error,
    search,
    clearSearch,
    setFilters,
    clearFilters,
    hasResults,
    hasActiveFilters,
    getFilteredResults
  } = useSearchStore();

  const { selectNote } = useNoteStore();
  const { selectFolder } = useFolderStore();

  // Local state
  const [inputValue, setInputValue] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showRecentQueries, setShowRecentQueries] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount if autoFocus is enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [results]);

  // Handle input change with debounced search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Show recent queries when input is focused and empty
    setShowRecentQueries(value.trim() === '');
    
    // Debounced search
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        search(value);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, clearSearch]);

  // Handle search submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      search(inputValue);
      setShowRecentQueries(false);
    }
  }, [inputValue, search]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setInputValue('');
    clearSearch();
    setShowRecentQueries(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [clearSearch]);

  // Handle result selection
  const handleResultSelect = useCallback((noteId: string) => {
    selectNote(noteId);
    onResultSelect?.(noteId);
    onClose?.();
  }, [selectNote, onResultSelect, onClose]);

  // Handle recent query selection
  const handleRecentQuerySelect = useCallback((recentQuery: string) => {
    setInputValue(recentQuery);
    search(recentQuery);
    setShowRecentQueries(false);
  }, [search]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const filteredResults = getFilteredResults();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (showRecentQueries && recentQueries.length > 0) {
          // Navigate recent queries
          setSelectedResultIndex(prev => 
            prev < recentQueries.length - 1 ? prev + 1 : 0
          );
        } else if (filteredResults.length > 0) {
          // Navigate search results
          setSelectedResultIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (showRecentQueries && recentQueries.length > 0) {
          // Navigate recent queries
          setSelectedResultIndex(prev => 
            prev > 0 ? prev - 1 : recentQueries.length - 1
          );
        } else if (filteredResults.length > 0) {
          // Navigate search results
          setSelectedResultIndex(prev => 
            prev > 0 ? prev - 1 : filteredResults.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (showRecentQueries && selectedResultIndex >= 0 && selectedResultIndex < recentQueries.length) {
          // Select recent query
          handleRecentQuerySelect(recentQueries[selectedResultIndex]);
        } else if (selectedResultIndex >= 0 && selectedResultIndex < filteredResults.length) {
          // Select search result
          const selectedResult = filteredResults[selectedResultIndex];
          handleResultSelect(selectedResult.noteId);
        } else if (inputValue.trim()) {
          // Submit search
          handleSubmit(e);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        if (showRecentQueries) {
          setShowRecentQueries(false);
        } else if (query) {
          handleClear();
        } else {
          onClose?.();
        }
        break;
        
      case 'Tab':
        if (e.shiftKey) {
          // Allow normal tab navigation
          return;
        }
        // Prevent tab from leaving the search interface
        e.preventDefault();
        break;
    }
  }, [
    getFilteredResults,
    showRecentQueries,
    recentQueries,
    selectedResultIndex,
    handleRecentQuerySelect,
    handleResultSelect,
    inputValue,
    handleSubmit,
    query,
    handleClear,
    onClose
  ]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (!inputValue.trim()) {
      setShowRecentQueries(true);
    }
  }, [inputValue]);

  // Handle input blur
  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Only hide recent queries if focus is leaving the search interface
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setShowRecentQueries(false);
    }
  }, []);

  // Get filtered results
  const filteredResults = getFilteredResults();

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full max-w-2xl mx-auto", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-10 pr-20"
            aria-label="Search notes"
            aria-expanded={hasResults() || showRecentQueries}
            aria-haspopup="listbox"
            role="combobox"
            aria-activedescendant={
              selectedResultIndex >= 0 
                ? `search-result-${selectedResultIndex}` 
                : undefined
            }
          />
          
          {/* Right side buttons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Filters toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                hasActiveFilters() && "text-primary bg-primary/10"
              )}
              onClick={() => setShowFilters(!showFilters)}
              title="Search filters"
            >
              <Filter className="h-3 w-3" />
            </Button>
            
            {/* Clear button */}
            {(inputValue || query) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClear}
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Search filters panel */}
      {showFilters && (
        <SearchFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          className="mt-2"
        />
      )}

      {/* Results container */}
      <div className="relative">
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-background border border-border rounded-md px-3 py-1 text-sm text-muted-foreground">
              Searching...
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Recent queries dropdown */}
        {showRecentQueries && recentQueries.length > 0 && (
          <div className="absolute top-2 left-0 right-0 z-20 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recent searches
              </div>
            </div>
            <div role="listbox" aria-label="Recent searches">
              {recentQueries.map((recentQuery, index) => (
                <button
                  key={recentQuery}
                  id={`search-result-${index}`}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                    selectedResultIndex === index && "bg-accent"
                  )}
                  onClick={() => handleRecentQuerySelect(recentQuery)}
                  role="option"
                  aria-selected={selectedResultIndex === index}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{recentQuery}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {!showRecentQueries && hasResults() && (
          <div 
            ref={resultsRef}
            className="mt-2 bg-popover border border-border rounded-md shadow-lg max-h-96 overflow-y-auto"
          >
            <div className="p-2 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                  {query && ` for "${query}"`}
                </div>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
            
            <div role="listbox" aria-label="Search results">
              {filteredResults.map((result, index) => (
                <SearchResultItem
                  key={result.noteId}
                  result={result}
                  isSelected={selectedResultIndex === index}
                  onClick={() => handleResultSelect(result.noteId)}
                  query={query}
                  id={`search-result-${index}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {!showRecentQueries && query && !isSearching && !hasResults() && !error && (
          <div className="mt-2 p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">No results found</h3>
            <p className="text-xs text-muted-foreground">
              No notes match "{query}". Try a different search term or adjust your filters.
            </p>
          </div>
        )}

        {/* Recent notes section (when no search query) */}
        {!query && !showRecentQueries && (
          <RecentNotesSection
            recentNotes={recentNotes}
            onNoteSelect={handleResultSelect}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
};