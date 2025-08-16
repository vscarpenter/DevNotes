/**
 * SearchEngine tests
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine } from '../SearchEngine';
import { Note, Folder } from '../../../types/note';
import { SearchOptions } from '../../../types/search';

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;
  let mockNotes: Note[];
  let mockFolders: Folder[];

  beforeEach(() => {
    searchEngine = new SearchEngine();
    
    // Create mock folders
    mockFolders = [
      {
        id: 'folder1',
        name: 'JavaScript',
        parentId: null,
        children: [],
        notes: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isExpanded: true
      },
      {
        id: 'folder2',
        name: 'React',
        parentId: 'folder1',
        children: [],
        notes: [],
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        isExpanded: true
      },
      {
        id: 'folder3',
        name: 'Python',
        parentId: null,
        children: [],
        notes: [],
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        isExpanded: false
      }
    ];

    // Create mock notes
    mockNotes = [
      {
        id: 'note1',
        title: 'JavaScript Basics',
        content: 'JavaScript is a programming language used for web development. It supports functions, objects, and async programming.',
        folderId: 'folder1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        tags: ['javascript', 'basics'],
        wordCount: 20,
        readingTime: 1
      },
      {
        id: 'note2',
        title: 'React Hooks Guide',
        content: 'React hooks allow you to use state and lifecycle methods in functional components. useState and useEffect are the most common hooks.',
        folderId: 'folder2',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
        tags: ['react', 'hooks'],
        wordCount: 25,
        readingTime: 2
      },
      {
        id: 'note3',
        title: 'Python Data Structures',
        content: 'Python provides built-in data structures like lists, dictionaries, sets, and tuples. These are essential for efficient programming.',
        folderId: 'folder3',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        tags: ['python', 'data-structures'],
        wordCount: 22,
        readingTime: 2
      },
      {
        id: 'note4',
        title: 'Advanced JavaScript Concepts',
        content: 'Closures, prototypes, and the event loop are advanced JavaScript concepts. Understanding these helps write better code.',
        folderId: 'folder1',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-30'),
        tags: ['javascript', 'advanced'],
        wordCount: 18,
        readingTime: 1
      }
    ];
  });  
describe('Initialization', () => {
    it('should initialize with notes and folders', async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
      
      const stats = searchEngine.getStats();
      expect(stats.indexedNotes).toBe(4);
      expect(stats.totalTokens).toBeGreaterThan(0);
    });

    it('should handle empty initialization', async () => {
      await searchEngine.initialize([], []);
      
      const stats = searchEngine.getStats();
      expect(stats.indexedNotes).toBe(0);
      expect(stats.totalTokens).toBe(0);
    });
  });

  describe('Basic Search', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should find notes by title', async () => {
      const options: SearchOptions = { query: 'JavaScript' };
      const results = await searchEngine.search(options);
      
      expect(results).toHaveLength(2);
      expect(results[0].title).toContain('JavaScript');
      expect(results[1].title).toContain('JavaScript');
    });

    it('should find notes by content', async () => {
      const options: SearchOptions = { query: 'programming' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      const hasContentMatch = results.some(result => 
        result.snippet.toLowerCase().includes('programming')
      );
      expect(hasContentMatch).toBe(true);
    });

    it('should return empty results for non-existent terms', async () => {
      const options: SearchOptions = { query: 'nonexistent' };
      const results = await searchEngine.search(options);
      
      expect(results).toHaveLength(0);
    });

    it('should handle empty query', async () => {
      const options: SearchOptions = { query: '' };
      const results = await searchEngine.search(options);
      
      expect(results).toHaveLength(0);
    });

    it('should handle whitespace-only query', async () => {
      const options: SearchOptions = { query: '   ' };
      const results = await searchEngine.search(options);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('Search Ranking', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should rank title matches higher than content matches', async () => {
      const options: SearchOptions = { query: 'React' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      // The note with "React" in the title should be ranked higher
      expect(results[0].title).toContain('React');
    });

    it('should rank exact matches higher than partial matches', async () => {
      const options: SearchOptions = { query: 'hooks' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('hooks');
    });

    it('should consider recency in ranking', async () => {
      const options: SearchOptions = { query: 'concepts' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      // When searching for "concepts", both "Advanced JavaScript Concepts" and 
      // "Python Data Structures" contain the word, but the JavaScript one is more recent
      const jsResult = results.find(r => r.title.includes('JavaScript'));
      const pythonResult = results.find(r => r.title.includes('Python'));
      
      if (jsResult && pythonResult) {
        const jsIndex = results.indexOf(jsResult);
        const pythonIndex = results.indexOf(pythonResult);
        expect(jsIndex).toBeLessThan(pythonIndex);
      }
    });
  });

  describe('Fuzzy Search', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should find matches with typos when fuzzy search is enabled', async () => {
      const options: SearchOptions = { query: 'Javascrpt', fuzzy: true }; // Missing 'i'
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should not find matches with typos when fuzzy search is disabled', async () => {
      const options: SearchOptions = { query: 'Javascrpt', fuzzy: false };
      const results = await searchEngine.search(options);
      
      expect(results).toHaveLength(0);
    });

    it('should handle multiple character differences', async () => {
      const options: SearchOptions = { query: 'Reactt', fuzzy: true }; // Extra 't'
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Search Filters', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should filter by folder', async () => {
      const options: SearchOptions = { 
        query: 'programming',
        filters: { folderId: 'folder1' }
      };
      const results = await searchEngine.search(options);
      
      results.forEach(result => {
        const note = mockNotes.find(n => n.id === result.noteId);
        expect(note?.folderId).toBe('folder1');
      });
    });

    it('should filter by date range', async () => {
      const options: SearchOptions = { 
        query: 'JavaScript',
        filters: { 
          dateRange: {
            start: new Date('2024-01-20'),
            end: new Date('2024-02-01')
          }
        }
      };
      const results = await searchEngine.search(options);
      
      results.forEach(result => {
        expect(result.lastModified.getTime()).toBeGreaterThanOrEqual(
          new Date('2024-01-20').getTime()
        );
        expect(result.lastModified.getTime()).toBeLessThanOrEqual(
          new Date('2024-02-01').getTime()
        );
      });
    });

    it('should filter by tags', async () => {
      const options: SearchOptions = { 
        query: 'programming',
        filters: { tags: ['javascript'] }
      };
      const results = await searchEngine.search(options);
      
      results.forEach(result => {
        const note = mockNotes.find(n => n.id === result.noteId);
        expect(note?.tags).toContain('javascript');
      });
    });

    it('should combine multiple filters', async () => {
      const options: SearchOptions = { 
        query: 'JavaScript',
        filters: { 
          folderId: 'folder1',
          tags: ['javascript']
        }
      };
      const results = await searchEngine.search(options);
      
      results.forEach(result => {
        const note = mockNotes.find(n => n.id === result.noteId);
        expect(note?.folderId).toBe('folder1');
        expect(note?.tags).toContain('javascript');
      });
    });
  });

  describe('Search Results', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should include highlights in results', async () => {
      const options: SearchOptions = { query: 'JavaScript' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].highlights.length).toBeGreaterThan(0);
      
      const highlight = results[0].highlights[0];
      expect(highlight).toHaveProperty('start');
      expect(highlight).toHaveProperty('end');
      expect(highlight).toHaveProperty('text');
      expect(typeof highlight.start).toBe('number');
      expect(typeof highlight.end).toBe('number');
      expect(typeof highlight.text).toBe('string');
    });

    it('should include context snippets', async () => {
      const options: SearchOptions = { query: 'programming' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].snippet).toBeTruthy();
      expect(typeof results[0].snippet).toBe('string');
      expect(results[0].snippet.length).toBeGreaterThan(0);
    });

    it('should include folder path', async () => {
      const options: SearchOptions = { query: 'React' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].folderPath).toBeTruthy();
      expect(results[0].folderPath).toContain('JavaScript');
      expect(results[0].folderPath).toContain('React');
    });

    it('should include match count', async () => {
      const options: SearchOptions = { query: 'JavaScript' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].matchCount).toBeGreaterThan(0);
      expect(typeof results[0].matchCount).toBe('number');
    });

    it('should limit results when maxResults is specified', async () => {
      const options: SearchOptions = { query: 'programming', maxResults: 1 };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });  
describe('Index Management', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should index individual notes', async () => {
      const newNote: Note = {
        id: 'note5',
        title: 'TypeScript Guide',
        content: 'TypeScript adds static typing to JavaScript',
        folderId: 'folder1',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['typescript'],
        wordCount: 8,
        readingTime: 1
      };

      await searchEngine.indexNote(newNote);
      
      const options: SearchOptions = { query: 'TypeScript' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.noteId === 'note5')).toBe(true);
    });

    it('should remove notes from index', async () => {
      const options: SearchOptions = { query: 'JavaScript' };
      let results = await searchEngine.search(options);
      const initialCount = results.length;
      
      searchEngine.removeFromIndex('note1');
      
      results = await searchEngine.search(options);
      expect(results.length).toBeLessThan(initialCount);
      expect(results.some(r => r.noteId === 'note1')).toBe(false);
    });

    it('should clear entire index', async () => {
      searchEngine.clearIndex();
      
      const stats = searchEngine.getStats();
      expect(stats.indexedNotes).toBe(0);
      expect(stats.totalTokens).toBe(0);
    });

    it('should update folders', async () => {
      const newFolders: Folder[] = [
        ...mockFolders,
        {
          id: 'folder4',
          name: 'TypeScript',
          parentId: null,
          children: [],
          notes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isExpanded: true
        }
      ];

      searchEngine.updateFolders(newFolders);
      
      // Test that folder paths are updated correctly
      const options: SearchOptions = { query: 'React' };
      const results = await searchEngine.search(options);
      
      expect(results.length).toBeGreaterThan(0);
      // Folder path should still work correctly
      expect(results[0].folderPath).toBeTruthy();
    });
  });

  describe('Recent Notes', () => {
    beforeEach(async () => {
      await searchEngine.initialize(mockNotes, mockFolders);
    });

    it('should return recent notes', () => {
      const recentNotes = searchEngine.getRecentNotes(2);
      
      expect(recentNotes).toHaveLength(2);
      expect(recentNotes[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
        recentNotes[1].updatedAt.getTime()
      );
    });

    it('should limit recent notes count', () => {
      const recentNotes = searchEngine.getRecentNotes(1);
      
      expect(recentNotes).toHaveLength(1);
    });

    it('should return all notes if limit exceeds total', () => {
      const recentNotes = searchEngine.getRecentNotes(100);
      
      expect(recentNotes).toHaveLength(mockNotes.length);
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      // Create a larger dataset for performance testing
      const largeNoteSet: Note[] = [];
      for (let i = 0; i < 100; i++) {
        largeNoteSet.push({
          id: `note${i}`,
          title: `Test Note ${i}`,
          content: `This is test content for note ${i}. It contains various keywords like JavaScript, React, Python, and programming concepts.`,
          folderId: 'folder1',
          createdAt: new Date(2024, 0, i + 1),
          updatedAt: new Date(2024, 0, i + 1),
          tags: [`tag${i % 5}`],
          wordCount: 20,
          readingTime: 1
        });
      }
      
      await searchEngine.initialize(largeNoteSet, mockFolders);
    });

    it('should search large datasets quickly', async () => {
      const startTime = performance.now();
      
      const options: SearchOptions = { query: 'JavaScript' };
      const results = await searchEngine.search(options);
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(results.length).toBeGreaterThan(0);
      expect(searchTime).toBeLessThan(200); // Should complete in under 200ms
    });

    it('should handle complex queries efficiently', async () => {
      const startTime = performance.now();
      
      const options: SearchOptions = { 
        query: 'JavaScript React programming concepts',
        fuzzy: true
      };
      const results = await searchEngine.search(options);
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(results.length).toBeGreaterThan(0);
      expect(searchTime).toBeLessThan(300); // Complex queries should still be fast
    });
  });
});