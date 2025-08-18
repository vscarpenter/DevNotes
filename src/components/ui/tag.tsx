/**
 * Tag UI components for displaying and managing tags
 * Requirements: 5.3, 5.4
 */

import React from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface TagProps {
  id: string;
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filter';
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  id,
  name,
  color,
  size = 'md',
  variant = 'default',
  removable = false,
  onClick,
  onRemove,
  className
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'text-white',
    outline: 'border-2 bg-transparent',
    filter: 'border bg-opacity-10 hover:bg-opacity-20'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        onClick && 'hover:opacity-80',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? color : undefined,
        borderColor: variant !== 'default' ? color : undefined,
        color: variant !== 'default' ? color : undefined
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      <span className="truncate max-w-32">{name}</span>
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${name} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export interface TagListProps {
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filter';
  removable?: boolean;
  onTagClick?: (tagId: string) => void;
  onTagRemove?: (tagId: string) => void;
  className?: string;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  size = 'md',
  variant = 'default',
  removable = false,
  onTagClick,
  onTagRemove,
  className
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          id={tag.id}
          name={tag.name}
          color={tag.color}
          size={size}
          variant={variant}
          removable={removable}
          onClick={() => onTagClick?.(tag.id)}
          onRemove={() => onTagRemove?.(tag.id)}
        />
      ))}
    </div>
  );
};

export interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (tagName: string) => void;
  suggestions?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  placeholder = 'Add tag...',
  className
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onChange('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: { name: string }) => {
    onSubmit(suggestion.name);
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      value && suggestion.name.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: suggestion.color }}
                  />
                  {suggestion.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          size="sm"
          disabled={!value.trim()}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export interface TagFilterProps {
  includeTags: string[];
  excludeTags: string[];
  availableTags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onIncludeTag: (tagId: string) => void;
  onExcludeTag: (tagId: string) => void;
  onRemoveIncludeTag: (tagId: string) => void;
  onRemoveExcludeTag: (tagId: string) => void;
  onClearFilter: () => void;
  className?: string;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  includeTags,
  excludeTags,
  availableTags,
  onIncludeTag,
  onExcludeTag,
  onRemoveIncludeTag,
  onRemoveExcludeTag,
  onClearFilter,
  className
}) => {
  const includeTagsData = includeTags
    .map(id => availableTags.find(tag => tag.id === id))
    .filter(Boolean) as Array<{ id: string; name: string; color: string }>;

  const excludeTagsData = excludeTags
    .map(id => availableTags.find(tag => tag.id === id))
    .filter(Boolean) as Array<{ id: string; name: string; color: string }>;

  const hasActiveFilter = includeTags.length > 0 || excludeTags.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {includeTagsData.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Include tags:
          </div>
          <TagList
            tags={includeTagsData}
            size="sm"
            variant="filter"
            removable
            onTagRemove={onRemoveIncludeTag}
          />
        </div>
      )}

      {excludeTagsData.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exclude tags:
          </div>
          <TagList
            tags={excludeTagsData}
            size="sm"
            variant="outline"
            removable
            onTagRemove={onRemoveExcludeTag}
          />
        </div>
      )}

      {hasActiveFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilter}
          className="w-full"
        >
          Clear tag filters
        </Button>
      )}
    </div>
  );
};