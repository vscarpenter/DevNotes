/**
 * UserGuideSearch - Search functionality for the user guide
 * Requirements: 1.4, 1.5, 5.2
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Clock, ChevronDown } from 'lucide-react';
import Fuse from 'fuse.js';
import { useUserGuideStore } from '../../stores/userGuideStore';
import { GuideSection } from '../../types/userGuide';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import guideContent, { loadGuideContent, populateGuideContent } from '../../content/userGuide/guideContent';
import { OptimizedSearch, PerformanceMonitor } from '../../lib/userGuide/performanceOptimizations';

interface UserGuideSearchProps {
  className?: string;
}

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'searchKeywords', weight: 0.3 }
  ],
  threshold: 0.4, // Lower = more strict matching
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

export const UserGuideSearch: React.FC<UserGuideSearchProps> = ({
  className = ''
}) => {
  const {
    searchQuery,
    searchResults,
    searchHistory,
    setSearchQuery,
    setSearchResults,
    addToSearchHistory,
    clearSearchHistory,
    navigateToSection
  } = useUserGuideStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const fuseRef = useRef<Fuse<GuideSection>>();

  // Load guide content and initialize Fuse.js instance
  useEffect(() => {
    const loadContentAndInitializeSearch = async () => {
      try {
        const content = await loadGuideContent();
        populateGuideContent(content);
        
        const allSections: GuideSection[] = [];
        Object.values(content.sections).forEach(category => {
          Object.values(category).forEach(section => {
            allSections.push(section);
          });
        });

        fuseRef.current = new Fuse(allSections, fuseOptions);
        setIsContentLoaded(true);
      } catch (error) {
        console.error('Failed to load guide content for search:', error);
      }
    };

    loadContentAndInitializeSearch();
  }, []);

  // Optimized search function with caching
  const performSearch = useCallback(async (query: string) => {
    if (!fuseRef.current || !isContentLoaded) return;

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Use optimized search with caching
    const searchFunction = async (searchQuery: string): Promise<GuideSection[]> => {
      const results = fuseRef.current!.search(searchQuery);
      return results.map(result => result.item);
    };

    try {
      const sections = await OptimizedSearch.search(query, searchFunction);
      setSearchResults(sections);
      
      // Log performance warnings if search is slow
      PerformanceMonitor.logPerformanceWarnings();
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  }, [setSearchResults]);

  // Handle search input changes with optimized debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setHighlightedIndex(-1);

    // Use optimized debounced search
    OptimizedSearch.debouncedSearch(
      value,
      async (searchQuery: string): Promise<GuideSection[]> => {
        if (!fuseRef.current) return [];
        const results = fuseRef.current.search(searchQuery);
        return results.map(result => result.item);
      },
      (results: GuideSection[]) => {
        setSearchResults(results);
        PerformanceMonitor.logPerformanceWarnings();
      }
    );
  }, [setSearchQuery, setSearchResults]);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    if (searchQuery.trim() === '' && searchHistory.length > 0) {
      setShowHistory(true);
    }
  }, [searchQuery, searchHistory.length]);

  // Handle search input blur
  const handleSearchBlur = useCallback(() => {
    // Delay blur to allow clicking on results
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowHistory(false);
      setHighlightedIndex(-1);
    }, 150);
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      addToSearchHistory(trimmedQuery);
      setShowHistory(false);
      
      // If there are results, navigate to the first one
      if (searchResults.length > 0) {
        navigateToSection(searchResults[0].id);
      }
    }
  }, [addToSearchHistory, searchResults, navigateToSection]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const displayItems = showHistory ? searchHistory : searchResults;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < displayItems.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        event.preventDefault();
        if (showHistory && highlightedIndex >= 0) {
          const selectedQuery = searchHistory[highlightedIndex];
          handleSearchChange(selectedQuery);
          setShowHistory(false);
        } else if (highlightedIndex >= 0 && searchResults.length > 0) {
          navigateToSection(searchResults[highlightedIndex].id);
        } else {
          handleSearchSubmit(searchQuery);
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        if (showHistory) {
          setShowHistory(false);
        } else if (searchQuery) {
          setSearchQuery('');
          setSearchResults([]);
        }
        setHighlightedIndex(-1);
        break;
      
      default:
        break;
    }
  }, [
    showHistory,
    searchHistory,
    searchResults,
    highlightedIndex,
    searchQuery,
    handleSearchChange,
    handleSearchSubmit,
    navigateToSection,
    setSearchQuery,
    setSearchResults
  ]);

  // Handle history item click
  const handleHistoryClick = useCallback((query: string) => {
    handleSearchChange(query);
    setShowHistory(false);
    searchInputRef.current?.focus();
  }, [handleSearchChange]);

  // Handle result item click
  const handleResultClick = useCallback((section: GuideSection) => {
    navigateToSection(section.id);
    addToSearchHistory(searchQuery);
  }, [navigateToSection, addToSearchHistory, searchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  }, [setSearchQuery, setSearchResults]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const showDropdown = isSearchFocused && (showHistory || searchResults.length > 0);
  const displayItems = showHistory ? searchHistory : searchResults;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search user guide..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 w-full"
          aria-label="Search user guide"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-owns={showDropdown ? 'search-results' : undefined}
          aria-activedescendant={highlightedIndex >= 0 ? `search-item-${highlightedIndex}` : undefined}
          aria-describedby="search-instructions"
          role="combobox"
          autoComplete="off"
        />
        
        {/* Clear button */}
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Instructions - Screen reader only */}
      <div id="search-instructions" className="sr-only">
        Use arrow keys to navigate search results, Enter to select, Escape to close
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div 
          id="search-results"
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label={showHistory ? "Search history" : "Search results"}
        >
          {showHistory ? (
            /* Search History */
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Recent Searches
                </span>
                {searchHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 h-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {searchHistory.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No recent searches
                </div>
              ) : (
                <ul role="listbox" aria-label="Search history">
                  {searchHistory.map((query, index) => (
                    <li key={index} role="option" aria-selected={index === highlightedIndex}>
                      <button
                        id={`search-item-${index}`}
                        onClick={() => handleHistoryClick(query)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none flex items-center gap-2 ${
                          index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        aria-label={`Search for ${query}`}
                      >
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{query}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            /* Search Results */
            <>
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Search Results ({searchResults.length})
                </span>
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <ul role="listbox" aria-label="Search results">
                  {searchResults.map((section, index) => (
                    <li key={section.id} role="option" aria-selected={index === highlightedIndex}>
                      <button
                        id={`search-item-${index}`}
                        onClick={() => handleResultClick(section)}
                        className={`w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                          index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        aria-label={`Go to ${section.title} in ${section.category.replace('-', ' ')} section`}
                        aria-describedby={`result-desc-${index}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {section.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {section.content}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                                {section.category.replace('-', ' ')}
                              </span>
                            </div>
                            <div id={`result-desc-${index}`} className="sr-only">
                              Search result: {section.title} from {section.category.replace('-', ' ')} section. Content preview: {section.content.substring(0, 100)}...
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400 transform -rotate-90 shrink-0" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};