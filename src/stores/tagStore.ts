/**
 * Tag management store using Zustand
 * Handles tag CRUD operations and tag-based filtering
 * Requirements: 5.3, 5.4
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Tag, TagFilter } from '../types/note';
import { databaseService } from '../lib/db/DatabaseService';

interface TagState {
  // State
  tags: Record<string, Tag>;
  tagFilter: TagFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<string>;
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  updateTagUsage: () => Promise<void>;
  
  // Filter actions
  setTagFilter: (filter: TagFilter) => void;
  addIncludeTag: (tagId: string) => void;
  removeIncludeTag: (tagId: string) => void;
  addExcludeTag: (tagId: string) => void;
  removeExcludeTag: (tagId: string) => void;
  clearTagFilter: () => void;
  
  // Computed getters
  getTag: (id: string) => Tag | undefined;
  getTagByName: (name: string) => Tag | undefined;
  getAllTags: () => Tag[];
  getPopularTags: (limit?: number) => Tag[];
  getTagSuggestions: (query: string) => Tag[];
  hasActiveFilter: () => boolean;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export const useTagStore = create<TagState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    tags: {},
    tagFilter: { includeTags: [], excludeTags: [] },
    isLoading: false,
    error: null,

    // Actions
    loadTags: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.getAllTags();
        
        if (result.success && result.data) {
          const tagsMap = result.data.reduce((acc, tag) => {
            acc[tag.id] = tag;
            return acc;
          }, {} as Record<string, Tag>);
          
          set({ tags: tagsMap, isLoading: false });
        } else {
          set({ error: result.error || 'Failed to load tags', isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load tags', 
          isLoading: false 
        });
      }
    },

    createTag: async (name: string, color?: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Check if tag already exists
        const existingTag = get().getTagByName(name);
        if (existingTag) {
          set({ isLoading: false });
          return existingTag.id;
        }

        const tagInput = {
          name: name.trim(),
          color: color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
          usageCount: 0
        };

        const result = await databaseService.createTag(tagInput);
        
        if (result.success && result.data) {
          const newTag = result.data;
          set(state => ({
            tags: { ...state.tags, [newTag.id]: newTag },
            isLoading: false
          }));
          
          return newTag.id;
        } else {
          set({ error: result.error || 'Failed to create tag', isLoading: false });
          throw new Error(result.error || 'Failed to create tag');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create tag';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    updateTag: async (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.updateTag(id, updates);
        
        if (result.success && result.data) {
          const updatedTag = result.data;
          set(state => ({
            tags: { ...state.tags, [id]: updatedTag },
            isLoading: false
          }));
        } else {
          set({ error: result.error || 'Failed to update tag', isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update tag';
        set({ error: errorMessage, isLoading: false });
      }
    },

    deleteTag: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await databaseService.deleteTag(id);
        
        if (result.success) {
          set(state => {
            const { [id]: _deleted, ...remainingTags } = state.tags;
            return {
              tags: remainingTags,
              isLoading: false
            };
          });
        } else {
          set({ error: result.error || 'Failed to delete tag', isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete tag';
        set({ error: errorMessage, isLoading: false });
      }
    },

    updateTagUsage: async () => {
      try {
        const result = await databaseService.updateTagUsageCounts();
        
        if (result.success && result.data) {
          const updatedTags = result.data.reduce((acc, tag) => {
            acc[tag.id] = tag;
            return acc;
          }, {} as Record<string, Tag>);
          
          set(state => ({
            tags: { ...state.tags, ...updatedTags }
          }));
        }
      } catch (error) {
        console.error('Failed to update tag usage counts:', error);
      }
    },

    // Filter actions
    setTagFilter: (filter: TagFilter) => {
      set({ tagFilter: filter });
    },

    addIncludeTag: (tagId: string) => {
      set(state => ({
        tagFilter: {
          ...state.tagFilter,
          includeTags: [...state.tagFilter.includeTags.filter(id => id !== tagId), tagId],
          excludeTags: state.tagFilter.excludeTags.filter(id => id !== tagId)
        }
      }));
    },

    removeIncludeTag: (tagId: string) => {
      set(state => ({
        tagFilter: {
          ...state.tagFilter,
          includeTags: state.tagFilter.includeTags.filter(id => id !== tagId)
        }
      }));
    },

    addExcludeTag: (tagId: string) => {
      set(state => ({
        tagFilter: {
          ...state.tagFilter,
          excludeTags: [...state.tagFilter.excludeTags.filter(id => id !== tagId), tagId],
          includeTags: state.tagFilter.includeTags.filter(id => id !== tagId)
        }
      }));
    },

    removeExcludeTag: (tagId: string) => {
      set(state => ({
        tagFilter: {
          ...state.tagFilter,
          excludeTags: state.tagFilter.excludeTags.filter(id => id !== tagId)
        }
      }));
    },

    clearTagFilter: () => {
      set({ tagFilter: { includeTags: [], excludeTags: [] } });
    },

    // Computed getters
    getTag: (id: string) => {
      return get().tags[id];
    },

    getTagByName: (name: string) => {
      const tags = Object.values(get().tags);
      return tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    },

    getAllTags: () => {
      return Object.values(get().tags).sort((a, b) => a.name.localeCompare(b.name));
    },

    getPopularTags: (limit = 10) => {
      return Object.values(get().tags)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    },

    getTagSuggestions: (query: string) => {
      if (!query.trim()) return [];
      
      const tags = Object.values(get().tags);
      const lowerQuery = query.toLowerCase();
      
      return tags
        .filter(tag => tag.name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
          // Prioritize exact matches, then starts with, then contains
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          if (aName === lowerQuery) return -1;
          if (bName === lowerQuery) return 1;
          if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery)) return -1;
          if (bName.startsWith(lowerQuery) && !aName.startsWith(lowerQuery)) return 1;
          
          return b.usageCount - a.usageCount;
        })
        .slice(0, 10);
    },

    hasActiveFilter: () => {
      const { includeTags, excludeTags } = get().tagFilter;
      return includeTags.length > 0 || excludeTags.length > 0;
    }
  }))
);