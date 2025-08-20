/**
 * Markdown processor for user guide content
 * Handles markdown parsing, syntax highlighting, and math rendering
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

// Import highlight.js languages for code syntax highlighting
import 'prismjs/themes/prism-tomorrow.css';

/**
 * Process markdown content into HTML with timeout protection
 */
export const processMarkdown = async (markdown: string): Promise<string> => {
  try {
    // Validate input to prevent processing extremely large content
    if (!markdown || typeof markdown !== 'string') {
      console.warn('Invalid markdown content received');
      return '<div class="markdown-error">Invalid content format</div>';
    }
    
    // Limit content size to prevent memory issues
    const MAX_CONTENT_LENGTH = 100000; // ~100KB limit
    if (markdown.length > MAX_CONTENT_LENGTH) {
      console.warn(`Markdown content too large: ${markdown.length} chars`);
      return `<div class="markdown-error">Content too large to display (${Math.round(markdown.length/1024)}KB)</div>`;
    }

    // Add timeout protection to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Markdown processing timeout')), 5000);
    });

    const processingPromise = (async () => {
      try {
        const processor = unified()
          .use(remarkParse) // Parse markdown
          .use(remarkGfm) // GitHub Flavored Markdown support
          .use(remarkRehype, { allowDangerousHtml: false }) // Convert to HTML (safer)
          .use(rehypeHighlight, {
            // Simplified syntax highlighting to reduce processing time
            detect: false,
            ignoreMissing: true,
            subset: ['javascript', 'typescript', 'json', 'css', 'html', 'markdown', 'bash']
          })
          .use(rehypeStringify); // Convert to string

        const result = await processor.process(markdown);
        return String(result);
      } catch (processingError) {
        console.error('Error in unified processor:', processingError);
        throw processingError;
      }
    })();

    // Race between processing and timeout
    return await Promise.race([processingPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Fallback to basic HTML conversion
    return `<div class="markdown-fallback"><pre>${markdown}</pre></div>`;
  }
};

/**
 * Extract plain text from markdown for search indexing
 */
export const extractTextFromMarkdown = (markdown: string): string => {
  try {
    // Simple regex-based text extraction for search purposes
    return markdown
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove headers markup
      .replace(/^#{1,6}\s+/gm, '')
      // Remove emphasis markup
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Clean up whitespace
      .replace(/\n\s*\n/g, '\n')
      .trim();
  } catch (error) {
    console.error('Error extracting text from markdown:', error);
    return markdown;
  }
};

/**
 * Extract headings from markdown for navigation
 */
export const extractHeadings = (markdown: string): Array<{ level: number; text: string; id: string }> => {
  try {
    const headings: Array<{ level: number; text: string; id: string }> = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      headings.push({ level, text, id });
    }

    return headings;
  } catch (error) {
    console.error('Error extracting headings from markdown:', error);
    return [];
  }
};

/**
 * Generate table of contents from markdown
 */
export const generateTableOfContents = (markdown: string): string => {
  try {
    const headings = extractHeadings(markdown);
    
    if (headings.length === 0) {
      return '';
    }

    let toc = '<nav class="table-of-contents">\n<ul>\n';
    let currentLevel = 0;

    for (const heading of headings) {
      if (heading.level > currentLevel) {
        // Open new nested list
        for (let i = currentLevel; i < heading.level - 1; i++) {
          toc += '<li><ul>\n';
        }
        currentLevel = heading.level;
      } else if (heading.level < currentLevel) {
        // Close nested lists
        for (let i = currentLevel; i > heading.level; i--) {
          toc += '</ul></li>\n';
        }
        currentLevel = heading.level;
      }

      toc += `<li><a href="#${heading.id}">${heading.text}</a></li>\n`;
    }

    // Close remaining lists
    for (let i = currentLevel; i > 1; i--) {
      toc += '</ul></li>\n';
    }

    toc += '</ul>\n</nav>';
    return toc;
  } catch (error) {
    console.error('Error generating table of contents:', error);
    return '';
  }
};