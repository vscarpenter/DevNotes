/**
 * Preview Pane Component
 * Provides live markdown rendering with syntax highlighting, math, and diagrams
 * Requirements: 4.3, 4.5, 4.6, 4.7
 */

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import mermaid from 'mermaid';
import { useUIStore } from '../../stores/uiStore';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

// Note: Prism.js styles are handled by rehype-highlight

interface PreviewPaneProps {
  content: string;
  className?: string;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  content,
  className = '',
  onScroll
}) => {
  const { isDarkMode } = useUIStore();
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Geist, sans-serif'
    });
  }, [isDarkMode]);

  // Process markdown content with math and diagrams
  const processedContent = useMemo(() => {
    try {
      // Pre-process Mermaid diagrams to prevent conflicts with markdown processing
      let processedMarkdown = content;
      const mermaidBlocks: string[] = [];
      
      // Extract Mermaid blocks and replace with placeholders
      processedMarkdown = processedMarkdown.replace(
        /```mermaid\n([\s\S]*?)\n```/g,
        (match, diagram) => {
          const index = mermaidBlocks.length;
          mermaidBlocks.push(diagram.trim());
          return `<div class="mermaid-placeholder" data-index="${index}"></div>`;
        }
      );

      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm) // GitHub Flavored Markdown support
        .use(remarkMath) // Math support
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw) // Allow raw HTML
        .use(rehypeKatex, {
          errorColor: '#cc0000',
          throwOnError: false
        }) // KaTeX math rendering
        .use(rehypeHighlight, {
          detect: true,
          ignoreMissing: true
        })
        .use(rehypeStringify);

      let result = String(processor.processSync(processedMarkdown));
      
      // Replace Mermaid placeholders with actual diagrams
      result = result.replace(
        /<div class="mermaid-placeholder" data-index="(\d+)"><\/div>/g,
        (match, index) => {
          const diagramIndex = parseInt(index, 10);
          const diagram = mermaidBlocks[diagramIndex];
          if (diagram) {
            return `<div class="mermaid-diagram" data-diagram="${encodeURIComponent(diagram)}">${diagram}</div>`;
          }
          return '<div class="error">Invalid Mermaid diagram</div>';
        }
      );

      return result;
    } catch (error) {
      console.error('Markdown processing error:', error);
      return `<div class="error">Error processing markdown: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
  }, [content]);

  // Render Mermaid diagrams after content is updated
  useEffect(() => {
    if (previewRef.current) {
      const mermaidElements = previewRef.current.querySelectorAll('.mermaid-diagram');
      
      mermaidElements.forEach(async (element, index) => {
        try {
          const diagram = decodeURIComponent(element.getAttribute('data-diagram') || '');
          if (diagram) {
            const id = `mermaid-${Date.now()}-${index}`;
            const { svg } = await mermaid.render(id, diagram);
            element.innerHTML = svg;
            element.classList.add('mermaid-rendered');
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          element.innerHTML = `<div class="error">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
        }
      });
    }
  }, [processedContent]);

  // Handle scroll events for synchronization
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      const target = event.target as HTMLDivElement;
      onScroll(target.scrollTop, target.scrollHeight);
    }
  };

  // Scroll to specific position (for synchronized scrolling)
  const scrollToPosition = useCallback((scrollTop: number) => {
    if (previewRef.current) {
      previewRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Expose scroll method to parent via ref callback
  React.useEffect(() => {
    if (previewRef.current) {
      // Add custom property to DOM element (typed as unknown then HTMLDivElement with custom property)
      (previewRef.current as HTMLDivElement & { scrollToPosition: (scrollTop: number) => void }).scrollToPosition = scrollToPosition;
    }
  }, [scrollToPosition]);

  return (
    <div 
      ref={previewRef}
      className={`
        preview-pane overflow-auto h-full p-4
        ${isDarkMode ? 'dark' : 'light'}
        ${className}
      `}
      onScroll={handleScroll}
      data-testid="preview-pane"
    >
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      <style>{`
        .preview-pane {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
        }
        
        .preview-pane.dark {
          color-scheme: dark;
        }
        
        .preview-pane.light {
          color-scheme: light;
        }
        
        /* Custom prose styles */
        .prose {
          color: inherit;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: inherit;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .prose h1 {
          font-size: 2em;
          border-bottom: 1px solid currentColor;
          padding-bottom: 0.3em;
        }
        
        .prose h2 {
          font-size: 1.5em;
          border-bottom: 1px solid currentColor;
          padding-bottom: 0.3em;
        }
        
        .prose h3 {
          font-size: 1.25em;
        }
        
        .prose code {
          background-color: rgba(175, 184, 193, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.85em;
          font-family: 'Geist Mono', monospace;
        }
        
        .prose pre {
          background-color: rgba(175, 184, 193, 0.1);
          border: 1px solid rgba(175, 184, 193, 0.3);
          border-radius: 6px;
          padding: 1em;
          overflow-x: auto;
          font-family: 'Geist Mono', monospace;
          font-size: 0.875em;
          line-height: 1.45;
        }
        
        .prose pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        
        .prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        .prose th, .prose td {
          border: 1px solid rgba(175, 184, 193, 0.3);
          padding: 0.5em 1em;
          text-align: left;
        }
        
        .prose th {
          background-color: rgba(175, 184, 193, 0.1);
          font-weight: 600;
        }
        
        .prose blockquote {
          border-left: 4px solid rgba(175, 184, 193, 0.5);
          padding-left: 1em;
          margin-left: 0;
          font-style: italic;
          color: rgba(0, 0, 0, 0.7);
        }
        
        .dark .prose blockquote {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .prose ul, .prose ol {
          padding-left: 1.5em;
        }
        
        .prose li {
          margin: 0.25em 0;
        }
        
        .prose a {
          color: #0969da;
          text-decoration: underline;
        }
        
        .dark .prose a {
          color: #58a6ff;
        }
        
        .prose a:hover {
          text-decoration: none;
        }
        
        /* Task list styles */
        .prose ul.contains-task-list {
          list-style: none;
          padding-left: 0;
        }
        
        .prose .task-list-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }
        
        .prose .task-list-item input[type="checkbox"] {
          margin: 0;
          margin-top: 0.2em;
        }
        
        /* Math expression styles */
        .katex {
          font-size: 1em;
        }
        
        .katex-display {
          margin: 1em 0;
          text-align: center;
        }
        
        .katex-error {
          color: #cc0000;
          background-color: rgba(204, 0, 0, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Geist Mono', monospace;
          font-size: 0.9em;
        }
        
        /* Mermaid diagram styles */
        .mermaid-diagram {
          margin: 1.5em 0;
          text-align: center;
          background-color: transparent;
        }
        
        .mermaid-rendered svg {
          max-width: 100%;
          height: auto;
        }
        
        .dark .mermaid-rendered svg {
          filter: invert(0.9) hue-rotate(180deg);
        }
        
        /* Error styles */
        .error {
          color: #d73a49;
          background-color: #ffeef0;
          border: 1px solid #fdb8c0;
          border-radius: 6px;
          padding: 1em;
          margin: 1em 0;
          font-family: 'Geist Mono', monospace;
          font-size: 0.9em;
        }
        
        .dark .error {
          color: #f85149;
          background-color: #490202;
          border-color: #da3633;
        }
      `}</style>
    </div>
  );
};