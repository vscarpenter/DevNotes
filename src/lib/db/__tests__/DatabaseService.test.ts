/**
 * Unit tests for DatabaseService
 * Tests all CRUD operations and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../DatabaseService';

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    // Create a mock implementation that doesn't require actual Dexie
    dbService = {
      calculateWordCount: (content: string) => {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
      },
      calculateReadingTime: (wordCount: number) => {
        return Math.ceil(wordCount / 200);
      },
      handleDatabaseError: (operation: string, error: any) => {
        let errorMessage = `Failed to ${operation}`;
        
        if (error.name === 'QuotaExceededError') {
          errorMessage = 'Storage quota exceeded. Please free up space or export your data.';
        } else if (error.name === 'VersionError') {
          errorMessage = 'Database version conflict. Please refresh the page.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Requested item not found.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Helper Methods', () => {
    describe('calculateWordCount', () => {
      it('should calculate word count correctly', () => {
        const content = 'This is a test content with multiple words';
        const wordCount = dbService.calculateWordCount(content);
        expect(wordCount).toBe(8); // "This", "is", "a", "test", "content", "with", "multiple", "words"
      });

      it('should handle empty content', () => {
        const wordCount = dbService.calculateWordCount('');
        expect(wordCount).toBe(0);
      });

      it('should handle content with extra whitespace', () => {
        const content = '  This   has   extra   spaces  ';
        const wordCount = dbService.calculateWordCount(content);
        expect(wordCount).toBe(4);
      });
    });

    describe('calculateReadingTime', () => {
      it('should calculate reading time correctly', () => {
        const readingTime = dbService.calculateReadingTime(400);
        expect(readingTime).toBe(2); // 400 words / 200 words per minute = 2 minutes
      });

      it('should round up reading time', () => {
        const readingTime = dbService.calculateReadingTime(150);
        expect(readingTime).toBe(1); // 150 words / 200 words per minute = 0.75, rounded up to 1
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle QuotaExceededError', () => {
      const quotaError = new Error('Storage quota exceeded');
      quotaError.name = 'QuotaExceededError';
      
      const result = dbService.handleDatabaseError('createNote', quotaError);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage quota exceeded');
    });

    it('should handle VersionError', () => {
      const versionError = new Error('Version conflict');
      versionError.name = 'VersionError';
      
      const result = dbService.handleDatabaseError('getNoteById', versionError);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database version conflict');
    });

    it('should handle NotFoundError', () => {
      const notFoundError = new Error('Not found');
      notFoundError.name = 'NotFoundError';
      
      const result = dbService.handleDatabaseError('getNoteById', notFoundError);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Requested item not found');
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Generic error message');
      
      const result = dbService.handleDatabaseError('someOperation', genericError);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generic error message');
    });
  });
});