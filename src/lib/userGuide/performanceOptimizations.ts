/**
 * Performance optimization utilities for the user guide system
 * Requirements: 1.4, 1.5
 */

import { GuideSection, GuideContent } from '../../types/userGuide';

// Cache for loaded content sections
const contentCache = new Map<string, GuideSection>();
const searchCache = new Map<string, GuideSection[]>();

// Performance monitoring
interface PerformanceMetrics {
  searchTime: number;
  contentLoadTime: number;
  renderTime: number;
}

const performanceMetrics: PerformanceMetrics = {
  searchTime: 0,
  contentLoadTime: 0,
  renderTime: 0,
};

/**
 * Lazy loading utility for guide content sections
 */
export class LazyContentLoader {
  private static loadingPromises = new Map<string, Promise<GuideSection>>();

  static async loadSection(sectionId: string): Promise<GuideSection> {
    // Check cache first
    if (contentCache.has(sectionId)) {
      return contentCache.get(sectionId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(sectionId)) {
      return this.loadingPromises.get(sectionId)!;
    }

    // Start loading
    const loadPromise = this.loadSectionContent(sectionId);
    this.loadingPromises.set(sectionId, loadPromise);

    try {
      const section = await loadPromise;
      contentCache.set(sectionId, section);
      return section;
    } finally {
      this.loadingPromises.delete(sectionId);
    }
  }

  private static async loadSectionContent(sectionId: string): Promise<GuideSection> {
    const startTime = performance.now();

    try {
      // Dynamic import based on section ID
      const [category, section] = sectionId.split('/');
      const module = await import(`../../content/userGuide/markdown/${category}/${section}.md?raw`);
      const content = typeof module === 'string' ? module : module.default || module;

      // Get metadata
      const metadata = this.getSectionMetadata(sectionId);
      
      const guideSection: GuideSection = {
        id: sectionId,
        title: metadata.title,
        content: String(content),
        searchKeywords: metadata.searchKeywords,
        category: metadata.category,
      };

      performanceMetrics.contentLoadTime = performance.now() - startTime;
      return guideSection;
    } catch (error) {
      console.error(`Failed to load section ${sectionId}:`, error);
      
      // Return fallback content
      const metadata = this.getSectionMetadata(sectionId);
      return {
        id: sectionId,
        title: metadata.title,
        content: `# ${metadata.title}\n\nContent is currently unavailable. Please try again later.`,
        searchKeywords: metadata.searchKeywords,
        category: metadata.category,
      };
    }
  }

  private static getSectionMetadata(sectionId: string) {
    const metadataMap: Record<string, any> = {
      'getting-started/welcome': {
        title: 'Welcome to DevNotes',
        searchKeywords: ['welcome', 'introduction', 'getting started', 'overview', 'devnotes'],
        category: 'getting-started' as const
      },
      'getting-started/first-note': {
        title: 'Creating Your First Note',
        searchKeywords: ['first note', 'create', 'new note', 'editor', 'getting started'],
        category: 'getting-started' as const
      },
      'getting-started/organizing-notes': {
        title: 'Organizing Your Notes',
        searchKeywords: ['organize', 'folders', 'structure', 'hierarchy', 'management'],
        category: 'getting-started' as const
      },
      'features/markdown-editor': {
        title: 'Markdown Editor',
        searchKeywords: ['markdown', 'editor', 'syntax', 'preview', 'formatting', 'code'],
        category: 'features' as const
      },
      'features/search': {
        title: 'Search Functionality',
        searchKeywords: ['search', 'find', 'filter', 'query', 'operators'],
        category: 'features' as const
      },
      'features/export-import': {
        title: 'Export & Import',
        searchKeywords: ['export', 'import', 'backup', 'transfer', 'migration'],
        category: 'features' as const
      },
      'features/keyboard-shortcuts': {
        title: 'Keyboard Shortcuts',
        searchKeywords: ['keyboard', 'shortcuts', 'hotkeys', 'productivity', 'navigation'],
        category: 'features' as const
      },
      'advanced/power-user-tips': {
        title: 'Power User Tips',
        searchKeywords: ['power user', 'advanced', 'tips', 'tricks', 'productivity', 'workflow'],
        category: 'advanced' as const
      },
      'advanced/customization': {
        title: 'Customization Options',
        searchKeywords: ['customize', 'settings', 'preferences', 'configuration', 'themes'],
        category: 'advanced' as const
      },
      'advanced/data-management': {
        title: 'Data Management',
        searchKeywords: ['data', 'storage', 'indexeddb', 'management', 'backup'],
        category: 'advanced' as const
      },
      'troubleshooting/common-issues': {
        title: 'Common Issues',
        searchKeywords: ['issues', 'problems', 'troubleshooting', 'help', 'bugs'],
        category: 'troubleshooting' as const
      },
      'troubleshooting/performance': {
        title: 'Performance Optimization',
        searchKeywords: ['performance', 'speed', 'optimization', 'slow', 'memory'],
        category: 'troubleshooting' as const
      },
      'troubleshooting/data-recovery': {
        title: 'Data Recovery',
        searchKeywords: ['recovery', 'lost data', 'backup', 'restore', 'corruption'],
        category: 'troubleshooting' as const
      },
    };

    return metadataMap[sectionId] || {
      title: 'Unknown Section',
      searchKeywords: [],
      category: 'getting-started' as const
    };
  }

  static preloadSection(sectionId: string): void {
    // Preload in background without blocking
    this.loadSection(sectionId).catch(error => {
      console.warn(`Failed to preload section ${sectionId}:`, error);
    });
  }

  static clearCache(): void {
    contentCache.clear();
    this.loadingPromises.clear();
  }

  static getCacheSize(): number {
    return contentCache.size;
  }
}

/**
 * Optimized search with caching and debouncing
 */
export class OptimizedSearch {
  private static searchTimeout: NodeJS.Timeout | null = null;
  private static readonly DEBOUNCE_DELAY = 300;
  private static readonly CACHE_SIZE_LIMIT = 50;

  static async search(
    query: string,
    searchFunction: (query: string) => Promise<GuideSection[]>
  ): Promise<GuideSection[]> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cacheKey = query.toLowerCase().trim();
      if (searchCache.has(cacheKey)) {
        performanceMetrics.searchTime = performance.now() - startTime;
        return searchCache.get(cacheKey)!;
      }

      // Perform search
      const results = await searchFunction(query);
      
      // Cache results (with size limit)
      if (searchCache.size >= this.CACHE_SIZE_LIMIT) {
        // Remove oldest entries
        const firstKey = searchCache.keys().next().value;
        if (firstKey) {
          searchCache.delete(firstKey);
        }
      }
      
      searchCache.set(cacheKey, results);
      performanceMetrics.searchTime = performance.now() - startTime;
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      performanceMetrics.searchTime = performance.now() - startTime;
      return [];
    }
  }

  static debouncedSearch(
    query: string,
    searchFunction: (query: string) => Promise<GuideSection[]>,
    callback: (results: GuideSection[]) => void
  ): void {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout
    this.searchTimeout = setTimeout(async () => {
      const results = await this.search(query, searchFunction);
      callback(results);
    }, this.DEBOUNCE_DELAY);
  }

  static clearSearchCache(): void {
    searchCache.clear();
  }

  static getSearchCacheSize(): number {
    return searchCache.size;
  }
}

/**
 * Virtual scrolling utility for long content
 */
export class VirtualScrollManager {
  private container: HTMLElement;
  private items: HTMLElement[];
  private itemHeight: number;
  private visibleCount: number;
  private scrollTop: number = 0;
  private startIndex: number = 0;
  private endIndex: number = 0;

  constructor(
    container: HTMLElement,
    items: HTMLElement[],
    itemHeight: number = 100
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer
    
    this.setupVirtualScrolling();
  }

  private setupVirtualScrolling(): void {
    // Set container height
    const totalHeight = this.items.length * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;
    this.container.style.position = 'relative';

    // Initial render
    this.updateVisibleItems();

    // Add scroll listener
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleScroll(): void {
    this.scrollTop = this.container.scrollTop;
    this.updateVisibleItems();
  }

  private updateVisibleItems(): void {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    this.endIndex = Math.min(
      this.startIndex + this.visibleCount,
      this.items.length
    );

    // Hide all items first
    this.items.forEach(item => {
      item.style.display = 'none';
    });

    // Show visible items
    for (let i = this.startIndex; i < this.endIndex; i++) {
      const item = this.items[i];
      if (item) {
        item.style.display = 'block';
        item.style.position = 'absolute';
        item.style.top = `${i * this.itemHeight}px`;
        item.style.width = '100%';
      }
    }
  }

  updateItems(newItems: HTMLElement[]): void {
    this.items = newItems;
    const totalHeight = this.items.length * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;
    this.updateVisibleItems();
  }

  scrollToIndex(index: number): void {
    const targetScrollTop = index * this.itemHeight;
    this.container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }

  destroy(): void {
    this.container.removeEventListener('scroll', this.handleScroll.bind(this));
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  static getMetrics(): PerformanceMetrics {
    return { ...performanceMetrics };
  }

  static resetMetrics(): void {
    performanceMetrics.searchTime = 0;
    performanceMetrics.contentLoadTime = 0;
    performanceMetrics.renderTime = 0;
  }

  static measureRenderTime<T>(fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    performanceMetrics.renderTime = performance.now() - startTime;
    return result;
  }

  static async measureAsyncRenderTime<T>(fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    performanceMetrics.renderTime = performance.now() - startTime;
    return result;
  }

  static logPerformanceWarnings(): void {
    const metrics = this.getMetrics();
    
    if (metrics.searchTime > 100) {
      console.warn(`Search performance warning: ${metrics.searchTime.toFixed(2)}ms (target: <100ms)`);
    }
    
    if (metrics.contentLoadTime > 200) {
      console.warn(`Content load performance warning: ${metrics.contentLoadTime.toFixed(2)}ms (target: <200ms)`);
    }
    
    if (metrics.renderTime > 50) {
      console.warn(`Render performance warning: ${metrics.renderTime.toFixed(2)}ms (target: <50ms)`);
    }
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static readonly MAX_CACHE_SIZE = 20; // Maximum cached sections
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static cleanupTimer: NodeJS.Timeout | null = null;

  static startMemoryManagement(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  static stopMemoryManagement(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private static performCleanup(): void {
    // Clean up content cache if it's too large
    if (contentCache.size > this.MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(contentCache.keys()).slice(0, contentCache.size - this.MAX_CACHE_SIZE);
      keysToDelete.forEach(key => contentCache.delete(key));
      console.log(`Cleaned up ${keysToDelete.length} cached content sections`);
    }

    // Clean up search cache if it's too large
    if (searchCache.size > OptimizedSearch.getSearchCacheSize()) {
      OptimizedSearch.clearSearchCache();
      console.log('Cleaned up search cache');
    }
  }

  static getMemoryUsage(): {
    contentCacheSize: number;
    searchCacheSize: number;
    totalCacheSize: number;
  } {
    return {
      contentCacheSize: contentCache.size,
      searchCacheSize: searchCache.size,
      totalCacheSize: contentCache.size + searchCache.size,
    };
  }

  static clearAllCaches(): void {
    LazyContentLoader.clearCache();
    OptimizedSearch.clearSearchCache();
    console.log('All caches cleared');
  }
}

// Initialize memory management
if (typeof window !== 'undefined') {
  MemoryManager.startMemoryManagement();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    MemoryManager.stopMemoryManagement();
  });
}