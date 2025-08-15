/**
 * UI state management store using Zustand
 * Handles application UI state like theme, sidebar, and layout preferences
 * Requirements: 2.1, 2.2, 2.4, 2.5
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type PanelLayout = 'split' | 'editor-only' | 'preview-only';
export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface UIState {
  // Layout state
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  panelLayout: PanelLayout;
  
  // Theme state
  theme: Theme;
  isDarkMode: boolean;
  
  // Editor state
  isPreviewMode: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  
  // Application state
  isLoading: boolean;
  saveStatus: SaveStatus;
  error: string | null;
  
  // Search state
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Modal state
  activeModal: string | null;
  
  // Actions
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  setPanelLayout: (layout: PanelLayout) => void;
  
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  
  togglePreviewMode: () => void;
  setPreviewMode: (enabled: boolean) => void;
  toggleLineNumbers: () => void;
  toggleWordWrap: () => void;
  setFontSize: (size: number) => void;
  
  setLoading: (loading: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Computed getters
  getEffectiveTheme: () => 'light' | 'dark';
  isModalOpen: (modalId: string) => boolean;
}

const SIDEBAR_MIN_WIDTH = 250;
const SIDEBAR_MAX_WIDTH = 500;
const SIDEBAR_DEFAULT_WIDTH = 300;

export const useUIStore = create<UIState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
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
      
      activeModal: null,

      // Layout actions
      setSidebarWidth: (width: number) => {
        const clampedWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width));
        set({ sidebarWidth: clampedWidth });
      },

      toggleSidebar: () => {
        set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },

      collapseSidebar: () => {
        set({ isSidebarCollapsed: true });
      },

      expandSidebar: () => {
        set({ isSidebarCollapsed: false });
      },

      setPanelLayout: (layout: PanelLayout) => {
        set({ panelLayout: layout });
      },

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Update isDarkMode based on theme and system preference
        if (theme === 'system') {
          if (typeof window !== 'undefined' && window.matchMedia) {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            set({ isDarkMode: systemDark });
          } else {
            set({ isDarkMode: false }); // Default to light in test environment
          }
        } else {
          set({ isDarkMode: theme === 'dark' });
        }
      },

      toggleDarkMode: () => {
        const currentTheme = get().theme;
        if (currentTheme === 'system') {
          // If system theme, switch to explicit light/dark
          if (typeof window !== 'undefined' && window.matchMedia) {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            get().setTheme(systemDark ? 'light' : 'dark');
          } else {
            get().setTheme('dark'); // Default toggle in test environment
          }
        } else {
          // Toggle between light and dark
          get().setTheme(currentTheme === 'light' ? 'dark' : 'light');
        }
      },

      // Editor actions
      togglePreviewMode: () => {
        set(state => ({ isPreviewMode: !state.isPreviewMode }));
      },

      setPreviewMode: (enabled: boolean) => {
        set({ isPreviewMode: enabled });
      },

      toggleLineNumbers: () => {
        set(state => ({ showLineNumbers: !state.showLineNumbers }));
      },

      toggleWordWrap: () => {
        set(state => ({ wordWrap: !state.wordWrap }));
      },

      setFontSize: (size: number) => {
        const clampedSize = Math.max(10, Math.min(24, size));
        set({ fontSize: clampedSize });
      },

      // Application state actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setSaveStatus: (status: SaveStatus) => {
        set({ saveStatus: status });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Search actions
      setSearchOpen: (open: boolean) => {
        set({ isSearchOpen: open });
        if (!open) {
          set({ searchQuery: '' });
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      clearSearch: () => {
        set({ searchQuery: '', isSearchOpen: false });
      },

      // Modal actions
      openModal: (modalId: string) => {
        set({ activeModal: modalId });
      },

      closeModal: () => {
        set({ activeModal: null });
      },

      // Computed getters
      getEffectiveTheme: () => {
        const { theme, isDarkMode } = get();
        if (theme === 'system') {
          if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          return 'light'; // Default to light in test environment
        }
        return isDarkMode ? 'dark' : 'light';
      },

      isModalOpen: (modalId: string) => {
        return get().activeModal === modalId;
      }
    })),
    {
      name: 'devnotes-ui-store',
      partialize: (state) => ({
        // Persist only user preferences, not transient state
        sidebarWidth: state.sidebarWidth,
        isSidebarCollapsed: state.isSidebarCollapsed,
        panelLayout: state.panelLayout,
        theme: state.theme,
        showLineNumbers: state.showLineNumbers,
        wordWrap: state.wordWrap,
        fontSize: state.fontSize
      })
    }
  )
);

// System theme change listener
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = (e: MediaQueryListEvent) => {
    const store = useUIStore.getState();
    if (store.theme === 'system') {
      useUIStore.setState({ isDarkMode: e.matches });
    }
  };
  
  mediaQuery.addEventListener('change', handleThemeChange);
  
  // Set initial dark mode state
  const initialStore = useUIStore.getState();
  if (initialStore.theme === 'system') {
    useUIStore.setState({ isDarkMode: mediaQuery.matches });
  }
}