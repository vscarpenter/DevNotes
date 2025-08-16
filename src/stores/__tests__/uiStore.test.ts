/**
 * Unit tests for UI store
 * Tests UI state management and preferences
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '../uiStore';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

// Mock window object for testing environment
Object.defineProperty(globalThis, 'window', {
  value: {
    matchMedia: mockMatchMedia
  },
  writable: true
});

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state to defaults
    useUIStore.setState({
      sidebarWidth: 300,
      isSidebarCollapsed: false,
      panelLayout: 'split',
      theme: 'system',
      isDarkMode: false,
      isPreviewMode: false,
      showLineNumbers: true,
      wordWrap: true,
      fontSize: 14,
      isLoading: false,
      saveStatus: 'saved',
      error: null,
      isSearchOpen: false,
      searchQuery: '',
      activeModal: null
    });

    // Clear all mocks
    vi.clearAllMocks();
    
    // Setup default matchMedia mock
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
  });

  describe('sidebar management', () => {
    it('should set sidebar width within bounds', () => {
      const store = useUIStore.getState();
      
      // Test normal width
      store.setSidebarWidth(350);
      expect(useUIStore.getState().sidebarWidth).toBe(350);
      
      // Test minimum bound
      store.setSidebarWidth(200);
      expect(useUIStore.getState().sidebarWidth).toBe(250); // Clamped to minimum
      
      // Test maximum bound
      store.setSidebarWidth(600);
      expect(useUIStore.getState().sidebarWidth).toBe(500); // Clamped to maximum
    });

    it('should toggle sidebar collapse', () => {
      const store = useUIStore.getState();
      
      expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
      
      store.toggleSidebar();
      expect(useUIStore.getState().isSidebarCollapsed).toBe(true);
      
      store.toggleSidebar();
      expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
    });

    it('should collapse and expand sidebar', () => {
      const store = useUIStore.getState();
      
      store.collapseSidebar();
      expect(useUIStore.getState().isSidebarCollapsed).toBe(true);
      
      store.expandSidebar();
      expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
    });
  });

  describe('panel layout management', () => {
    it('should set panel layout', () => {
      const store = useUIStore.getState();
      
      store.setPanelLayout('editor-only');
      expect(useUIStore.getState().panelLayout).toBe('editor-only');
      
      store.setPanelLayout('preview-only');
      expect(useUIStore.getState().panelLayout).toBe('preview-only');
      
      store.setPanelLayout('split');
      expect(useUIStore.getState().panelLayout).toBe('split');
    });
  });

  describe('theme management', () => {
    it('should set explicit light theme', () => {
      const store = useUIStore.getState();
      
      store.setTheme('light');
      
      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
      expect(state.isDarkMode).toBe(false);
    });

    it('should set explicit dark theme', () => {
      const store = useUIStore.getState();
      
      store.setTheme('dark');
      
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.isDarkMode).toBe(true);
    });

    it('should set system theme based on media query', () => {
      // Mock system dark mode
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });

      const store = useUIStore.getState();
      store.setTheme('system');
      
      const state = useUIStore.getState();
      expect(state.theme).toBe('system');
      expect(state.isDarkMode).toBe(true);
    });

    it('should toggle dark mode from system theme', () => {
      // Mock system light mode
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });

      useUIStore.setState({ theme: 'system', isDarkMode: false });
      
      const store = useUIStore.getState();
      store.toggleDarkMode();
      
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark'); // Should switch to explicit dark
      expect(state.isDarkMode).toBe(true);
    });

    it('should toggle between light and dark themes', () => {
      useUIStore.setState({ theme: 'light', isDarkMode: false });
      
      const store = useUIStore.getState();
      
      store.toggleDarkMode();
      let state = useUIStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.isDarkMode).toBe(true);
      
      store.toggleDarkMode();
      state = useUIStore.getState();
      expect(state.theme).toBe('light');
      expect(state.isDarkMode).toBe(false);
    });

    it('should get effective theme', () => {
      const store = useUIStore.getState();
      
      // Test explicit themes
      useUIStore.setState({ theme: 'light', isDarkMode: false });
      expect(store.getEffectiveTheme()).toBe('light');
      
      useUIStore.setState({ theme: 'dark', isDarkMode: true });
      expect(store.getEffectiveTheme()).toBe('dark');
      
      // Test system theme
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });
      
      useUIStore.setState({ theme: 'system' });
      expect(store.getEffectiveTheme()).toBe('dark');
    });
  });

  describe('editor preferences', () => {
    it('should toggle preview mode', () => {
      const store = useUIStore.getState();
      
      expect(useUIStore.getState().isPreviewMode).toBe(false);
      
      store.togglePreviewMode();
      expect(useUIStore.getState().isPreviewMode).toBe(true);
      
      store.togglePreviewMode();
      expect(useUIStore.getState().isPreviewMode).toBe(false);
    });

    it('should set preview mode', () => {
      const store = useUIStore.getState();
      
      store.setPreviewMode(true);
      expect(useUIStore.getState().isPreviewMode).toBe(true);
      
      store.setPreviewMode(false);
      expect(useUIStore.getState().isPreviewMode).toBe(false);
    });

    it('should toggle line numbers', () => {
      const store = useUIStore.getState();
      
      expect(useUIStore.getState().showLineNumbers).toBe(true);
      
      store.toggleLineNumbers();
      expect(useUIStore.getState().showLineNumbers).toBe(false);
      
      store.toggleLineNumbers();
      expect(useUIStore.getState().showLineNumbers).toBe(true);
    });

    it('should toggle word wrap', () => {
      const store = useUIStore.getState();
      
      expect(useUIStore.getState().wordWrap).toBe(true);
      
      store.toggleWordWrap();
      expect(useUIStore.getState().wordWrap).toBe(false);
      
      store.toggleWordWrap();
      expect(useUIStore.getState().wordWrap).toBe(true);
    });

    it('should set font size within bounds', () => {
      const store = useUIStore.getState();
      
      // Test normal size
      store.setFontSize(16);
      expect(useUIStore.getState().fontSize).toBe(16);
      
      // Test minimum bound
      store.setFontSize(8);
      expect(useUIStore.getState().fontSize).toBe(10); // Clamped to minimum
      
      // Test maximum bound
      store.setFontSize(30);
      expect(useUIStore.getState().fontSize).toBe(24); // Clamped to maximum
    });
  });

  describe('application state', () => {
    it('should set loading state', () => {
      const store = useUIStore.getState();
      
      store.setLoading(true);
      expect(useUIStore.getState().isLoading).toBe(true);
      
      store.setLoading(false);
      expect(useUIStore.getState().isLoading).toBe(false);
    });

    it('should set save status', () => {
      const store = useUIStore.getState();
      
      store.setSaveStatus('saving');
      expect(useUIStore.getState().saveStatus).toBe('saving');
      
      store.setSaveStatus('saved');
      expect(useUIStore.getState().saveStatus).toBe('saved');
      
      store.setSaveStatus('error');
      expect(useUIStore.getState().saveStatus).toBe('error');
    });

    it('should set and clear error', () => {
      const store = useUIStore.getState();
      
      store.setError('Test error');
      expect(useUIStore.getState().error).toBe('Test error');
      
      store.clearError();
      expect(useUIStore.getState().error).toBeNull();
    });
  });

  describe('search state', () => {
    it('should set search open and close', () => {
      const store = useUIStore.getState();
      
      store.setSearchOpen(true);
      let state = useUIStore.getState();
      expect(state.isSearchOpen).toBe(true);
      
      store.setSearchOpen(false);
      state = useUIStore.getState();
      expect(state.isSearchOpen).toBe(false);
      expect(state.searchQuery).toBe(''); // Should clear query when closing
    });

    it('should set search query', () => {
      const store = useUIStore.getState();
      
      store.setSearchQuery('test query');
      expect(useUIStore.getState().searchQuery).toBe('test query');
    });

    it('should clear search', () => {
      useUIStore.setState({
        isSearchOpen: true,
        searchQuery: 'test query'
      });
      
      const store = useUIStore.getState();
      store.clearSearch();
      
      const state = useUIStore.getState();
      expect(state.isSearchOpen).toBe(false);
      expect(state.searchQuery).toBe('');
    });
  });

  describe('modal management', () => {
    it('should open and close modals', () => {
      const store = useUIStore.getState();
      
      store.openModal('test-modal');
      expect(useUIStore.getState().activeModal).toBe('test-modal');
      
      store.closeModal();
      expect(useUIStore.getState().activeModal).toBeNull();
    });

    it('should check if modal is open', () => {
      useUIStore.setState({ activeModal: 'test-modal' });
      
      const store = useUIStore.getState();
      expect(store.isModalOpen('test-modal')).toBe(true);
      expect(store.isModalOpen('other-modal')).toBe(false);
    });
  });
});