import { describe, it, expect } from 'vitest';
import {
  tooltipContent,
  getTooltipConfig,
  createTooltipConfig,
  getContextualTooltips
} from '../tooltipContent';

describe('tooltipContent', () => {
  describe('getTooltipConfig', () => {
    it('returns tooltip config for valid ID', () => {
      const config = getTooltipConfig('editor-markdown-help');
      
      expect(config).toEqual({
        id: 'editor-markdown-help',
        content: 'Click for markdown syntax help and formatting tips',
        position: 'bottom',
        trigger: 'hover',
        delay: 500
      });
    });

    it('returns null for invalid ID', () => {
      const config = getTooltipConfig('non-existent-tooltip');
      expect(config).toBeNull();
    });

    it('returns null for empty string', () => {
      const config = getTooltipConfig('');
      expect(config).toBeNull();
    });
  });

  describe('createTooltipConfig', () => {
    it('creates tooltip config with default options', () => {
      const config = createTooltipConfig('test-id', 'Test content');
      
      expect(config).toEqual({
        id: 'test-id',
        content: 'Test content',
        position: 'top',
        trigger: 'hover',
        delay: 500
      });
    });

    it('creates tooltip config with custom options', () => {
      const config = createTooltipConfig('test-id', 'Test content', {
        position: 'bottom',
        trigger: 'click',
        delay: 300
      });
      
      expect(config).toEqual({
        id: 'test-id',
        content: 'Test content',
        position: 'bottom',
        trigger: 'click',
        delay: 300
      });
    });

    it('merges partial options with defaults', () => {
      const config = createTooltipConfig('test-id', 'Test content', {
        position: 'left'
      });
      
      expect(config).toEqual({
        id: 'test-id',
        content: 'Test content',
        position: 'left',
        trigger: 'hover',
        delay: 500
      });
    });
  });

  describe('getContextualTooltips', () => {
    it('returns editor tooltips when editing', () => {
      const tooltips = getContextualTooltips({ isEditing: true });
      
      expect(tooltips).toContain('editor-markdown-help');
      expect(tooltips).toContain('editor-toolbar-bold');
      expect(tooltips).toContain('editor-toolbar-italic');
      expect(tooltips).toContain('editor-toolbar-code');
      expect(tooltips).toContain('auto-save-indicator');
    });

    it('returns creation tooltips when no notes exist', () => {
      const tooltips = getContextualTooltips({ hasNotes: false });
      
      expect(tooltips).toContain('note-create');
      expect(tooltips).toContain('folder-create');
    });

    it('returns search tooltips when searching', () => {
      const tooltips = getContextualTooltips({ isSearching: true });
      
      expect(tooltips).toContain('search-syntax');
      expect(tooltips).toContain('search-filters');
    });

    it('returns list view tooltips for list view', () => {
      const tooltips = getContextualTooltips({ currentView: 'list' });
      
      expect(tooltips).toContain('folder-drag-drop');
      expect(tooltips).toContain('tag-filter');
    });

    it('combines tooltips for multiple contexts', () => {
      const tooltips = getContextualTooltips({
        isEditing: true,
        isSearching: true,
        currentView: 'editor'
      });
      
      // Should include both editor and search tooltips
      expect(tooltips).toContain('editor-markdown-help');
      expect(tooltips).toContain('search-syntax');
    });

    it('returns empty array for no context', () => {
      const tooltips = getContextualTooltips({});
      
      expect(tooltips).toEqual([]);
    });
  });

  describe('tooltip content validation', () => {
    it('has valid configuration for all predefined tooltips', () => {
      Object.entries(tooltipContent).forEach(([id, config]) => {
        expect(config.content).toBeTruthy();
        expect(config.content).toBeTypeOf('string');
        expect(['top', 'bottom', 'left', 'right']).toContain(config.position);
        expect(['hover', 'focus', 'click']).toContain(config.trigger);
        expect(config.delay).toBeTypeOf('number');
        expect(config.delay).toBeGreaterThan(0);
      });
    });

    it('has reasonable delay values', () => {
      Object.entries(tooltipContent).forEach(([id, config]) => {
        expect(config.delay).toBeGreaterThanOrEqual(100);
        expect(config.delay).toBeLessThanOrEqual(1000);
      });
    });

    it('has meaningful content for each tooltip', () => {
      Object.entries(tooltipContent).forEach(([id, config]) => {
        expect(config.content.length).toBeGreaterThan(10);
        expect(config.content).not.toMatch(/^(test|todo|placeholder)/i);
      });
    });
  });

  describe('tooltip categories', () => {
    it('includes editor-related tooltips', () => {
      const editorTooltips = Object.keys(tooltipContent).filter(id => 
        id.startsWith('editor-')
      );
      
      expect(editorTooltips.length).toBeGreaterThan(0);
      expect(editorTooltips).toContain('editor-markdown-help');
      expect(editorTooltips).toContain('editor-toolbar-bold');
    });

    it('includes navigation-related tooltips', () => {
      const navTooltips = Object.keys(tooltipContent).filter(id => 
        id.includes('folder') || id.includes('note') || id.includes('search')
      );
      
      expect(navTooltips.length).toBeGreaterThan(0);
      expect(navTooltips).toContain('folder-create');
      expect(navTooltips).toContain('note-create');
    });

    it('includes search-related tooltips', () => {
      const searchTooltips = Object.keys(tooltipContent).filter(id => 
        id.startsWith('search-')
      );
      
      expect(searchTooltips.length).toBeGreaterThan(0);
      expect(searchTooltips).toContain('search-filters');
      expect(searchTooltips).toContain('search-syntax');
    });

    it('includes tag-related tooltips', () => {
      const tagTooltips = Object.keys(tooltipContent).filter(id => 
        id.startsWith('tag-')
      );
      
      expect(tagTooltips.length).toBeGreaterThan(0);
      expect(tagTooltips).toContain('tag-create');
      expect(tagTooltips).toContain('tag-filter');
    });
  });
});