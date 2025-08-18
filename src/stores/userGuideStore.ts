import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GuideState, GuideActions, GuideSection } from '../types/userGuide';

interface UserGuideStore extends GuideState, GuideActions {
  // Deep linking actions
  openGuideFromURL: () => void;
  updateURLForSection: (sectionId: string) => void;
}

export const useUserGuideStore = create<UserGuideStore>()(
  persist(
    (set, get) => ({
      // State
      isOpen: false,
      currentSection: 'getting-started/welcome',
      searchQuery: '',
      searchResults: [],
      lastViewedSection: 'getting-started/welcome',
      searchHistory: [],

      // Actions
      openGuide: (sectionId?: string) => {
        const targetSection = sectionId || get().lastViewedSection;
        set({
          isOpen: true,
          currentSection: targetSection,
        });
        
        // Update URL for deep linking
        get().updateURLForSection(targetSection);
      },

      closeGuide: () => {
        set((state) => ({
          isOpen: false,
          lastViewedSection: state.currentSection,
        }));
        
        // Clear URL parameters when closing
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('guide');
          url.searchParams.delete('section');
          window.history.replaceState({}, '', url.toString());
        }
      },

      navigateToSection: (sectionId: string) => {
        set({
          currentSection: sectionId,
          searchQuery: '',
          searchResults: [],
        });
        
        // Update URL for deep linking
        get().updateURLForSection(sectionId);
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSearchResults: (results: GuideSection[]) => {
        set({ searchResults: results });
      },

      addToSearchHistory: (query: string) => {
        set((state) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery || state.searchHistory.includes(trimmedQuery)) {
            return state;
          }

          const newHistory = [trimmedQuery, ...state.searchHistory.slice(0, 4)];
          return { searchHistory: newHistory };
        });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // Deep linking functionality
      openGuideFromURL: () => {
        if (typeof window === 'undefined') return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const shouldOpenGuide = urlParams.get('guide') === 'true';
        const sectionId = urlParams.get('section');
        
        if (shouldOpenGuide) {
          set({
            isOpen: true,
            currentSection: sectionId || get().lastViewedSection,
          });
        }
      },

      updateURLForSection: (sectionId: string) => {
        if (typeof window === 'undefined') return;
        
        const url = new URL(window.location.href);
        url.searchParams.set('guide', 'true');
        url.searchParams.set('section', sectionId);
        
        // Use replaceState to avoid adding to browser history for each section change
        window.history.replaceState({}, '', url.toString());
      },
    }),
    {
      name: 'user-guide-storage',
      partialize: (state) => ({
        lastViewedSection: state.lastViewedSection,
        searchHistory: state.searchHistory,
      }),
    }
  )
);

// Initialize deep linking on store creation
if (typeof window !== 'undefined') {
  // Check URL parameters on page load
  const store = useUserGuideStore.getState();
  store.openGuideFromURL();
  
  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    const currentStore = useUserGuideStore.getState();
    currentStore.openGuideFromURL();
  });
}