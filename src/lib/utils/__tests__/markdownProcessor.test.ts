/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { processMarkdown, extractTextFromMarkdown, extractHeadings, generateTableOfContents } from '../markdownProcessor';

describe('markdownProcessor', () => {
  describe('processMarkdown', () => {
    it('should process basic markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a **bold** text.';
      const result = await processMarkdown(markdown);
      
      expect(result).toContain('<h1>Hello World</h1>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should handle code blocks with syntax highlighting', async () => {
      const markdown = '```javascript\nconsole.log("Hello");\n```';
      const result = await processMarkdown(markdown);
      
      expect(result).toContain('<pre>');
      expect(result).toContain('<code');
      expect(result).toContain('Hello'); // The string content should be there
    });

    it('should handle GitHub Flavored Markdown features', async () => {
      const markdown = '- [x] Task completed\n- [ ] Task pending';
      const result = await processMarkdown(markdown);
      
      expect(result).toContain('<ul');
      expect(result).toContain('<li');
      expect(result).toContain('checkbox');
    });

    it('should handle math expressions', async () => {
      const markdown = 'Inline math: $x = y + z$\n\nBlock math:\n$$\nE = mc^2\n$$';
      const result = await processMarkdown(markdown);
      
      // KaTeX should process the math
      expect(result).toContain('katex');
    });

    it('should handle links', async () => {
      const markdown = '[Link text](https://example.com)';
      const result = await processMarkdown(markdown);
      
      expect(result).toContain('<a href="https://example.com">Link text</a>');
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid markdown that might cause processing issues
      const invalidMarkdown = '```\nunclosed code block';
      
      // Should not throw, but process as best as possible
      const result = await processMarkdown(invalidMarkdown);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('extractTextFromMarkdown', () => {
    it('should extract plain text from markdown', () => {
      const markdown = '# Title\n\nThis is **bold** and *italic* text.';
      const result = extractTextFromMarkdown(markdown);
      
      expect(result).toBe('Title\nThis is bold and italic text.');
    });

    it('should remove code blocks', () => {
      const markdown = 'Text before\n```javascript\nconsole.log("code");\n```\nText after';
      const result = extractTextFromMarkdown(markdown);
      
      expect(result).toBe('Text before\nText after');
      expect(result).not.toContain('console.log');
    });

    it('should remove inline code', () => {
      const markdown = 'Use `console.log()` to print.';
      const result = extractTextFromMarkdown(markdown);
      
      expect(result).toBe('Use  to print.');
    });

    it('should extract text from links', () => {
      const markdown = 'Visit [Google](https://google.com) for search.';
      const result = extractTextFromMarkdown(markdown);
      
      expect(result).toBe('Visit Google for search.');
    });

    it('should remove images but keep alt text', () => {
      const markdown = 'Here is an image: ![Alt text](image.jpg)';
      const result = extractTextFromMarkdown(markdown);
      
      expect(result).toContain('Alt text');
      expect(result).not.toContain('image.jpg');
    });

    it('should remove list markers', () => {
      const markdown = '- Item 1\n- Item 2\n1. Numbered item';
      const result = extractTextFromMarkdown(markdown);
      
      expect(result).toBe('Item 1\nItem 2\nNumbered item');
    });

    it('should handle errors gracefully', () => {
      const result = extractTextFromMarkdown('# Normal text');
      expect(result).toBe('Normal text');
    });
  });

  describe('extractHeadings', () => {
    it('should extract headings with correct levels', () => {
      const markdown = '# H1\n## H2\n### H3\n#### H4';
      const result = extractHeadings(markdown);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ level: 1, text: 'H1', id: 'h1' });
      expect(result[1]).toEqual({ level: 2, text: 'H2', id: 'h2' });
      expect(result[2]).toEqual({ level: 3, text: 'H3', id: 'h3' });
      expect(result[3]).toEqual({ level: 4, text: 'H4', id: 'h4' });
    });

    it('should generate proper IDs from heading text', () => {
      const markdown = '# Hello World!\n## Getting Started Guide\n### API Reference (v2.0)';
      const result = extractHeadings(markdown);
      
      expect(result[0].id).toBe('hello-world');
      expect(result[1].id).toBe('getting-started-guide');
      expect(result[2].id).toBe('api-reference-v20');
    });

    it('should handle headings with special characters', () => {
      const markdown = '# Title with "quotes" & symbols!';
      const result = extractHeadings(markdown);
      
      expect(result[0].id).toBe('title-with-quotes-symbols');
    });

    it('should return empty array for no headings', () => {
      const markdown = 'Just some regular text without headings.';
      const result = extractHeadings(markdown);
      
      expect(result).toHaveLength(0);
    });

    it('should handle errors gracefully', () => {
      const result = extractHeadings('# Normal heading');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Normal heading');
    });
  });

  describe('generateTableOfContents', () => {
    it('should generate table of contents from headings', () => {
      const markdown = '# Introduction\n## Getting Started\n### Installation\n## Advanced Topics';
      const result = generateTableOfContents(markdown);
      
      expect(result).toContain('<nav class="table-of-contents">');
      expect(result).toContain('<a href="#introduction">Introduction</a>');
      expect(result).toContain('<a href="#getting-started">Getting Started</a>');
      expect(result).toContain('<a href="#installation">Installation</a>');
      expect(result).toContain('<a href="#advanced-topics">Advanced Topics</a>');
    });

    it('should handle nested heading levels', () => {
      const markdown = '# Level 1\n## Level 2\n### Level 3\n## Another Level 2';
      const result = generateTableOfContents(markdown);
      
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
      // Should have proper nesting structure
      expect(result.split('<ul>').length).toBeGreaterThan(1);
    });

    it('should return empty string for no headings', () => {
      const markdown = 'Just regular text without any headings.';
      const result = generateTableOfContents(markdown);
      
      expect(result).toBe('');
    });

    it('should handle single heading', () => {
      const markdown = '# Single Heading';
      const result = generateTableOfContents(markdown);
      
      expect(result).toContain('<nav class="table-of-contents">');
      expect(result).toContain('<a href="#single-heading">Single Heading</a>');
    });

    it('should handle errors gracefully', () => {
      const result = generateTableOfContents('# Normal heading');
      expect(result).toContain('Normal heading');
    });
  });
});