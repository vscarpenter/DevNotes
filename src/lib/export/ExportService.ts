/**
 * Export service for various file formats
 * Handles individual and bulk export operations
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { Note, Folder, ExportData } from '../../types';
import { databaseService } from '../db/DatabaseService';

export interface ExportOptions {
  format: 'markdown' | 'html' | 'json' | 'txt';
  includeMetadata?: boolean;
  preserveStructure?: boolean;
}

export interface BulkExportOptions extends ExportOptions {
  selectedNoteIds?: string[];
  selectedFolderIds?: string[];
  includeSubfolders?: boolean;
}

export interface ExportProgress {
  current: number;
  total: number;
  status: 'preparing' | 'processing' | 'complete' | 'error';
  message: string;
}

export type ProgressCallback = (progress: ExportProgress) => void;

export class ExportService {
  /**
   * Export a single note to specified format
   */
  async exportNote(
    noteId: string, 
    options: ExportOptions
  ): Promise<{ content: string; filename: string; mimeType: string }> {
    const result = await databaseService.getNoteById(noteId);
    
    if (!result.success || !result.data) {
      throw new Error(`Note not found: ${noteId}`);
    }

    const note = result.data;
    const folderResult = await databaseService.getFolderById(note.folderId);
    const folder = folderResult.data;

    switch (options.format) {
      case 'markdown':
        return this.exportNoteAsMarkdown(note, folder, options);
      case 'html':
        return this.exportNoteAsHTML(note, folder, options);
      case 'json':
        return this.exportNoteAsJSON(note, folder, options);
      case 'txt':
        return this.exportNoteAsText(note, folder, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export multiple notes as a ZIP archive
   */
  async exportBulk(
    options: BulkExportOptions,
    onProgress?: ProgressCallback
  ): Promise<{ content: Blob; filename: string; mimeType: string }> {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    // Get all notes and folders to export
    const { notes, folders } = await this.getExportData(options);
    
    const total = notes.length;
    let current = 0;

    onProgress?.({
      current: 0,
      total,
      status: 'preparing',
      message: 'Preparing export...'
    });

    // Create folder structure in ZIP if preserveStructure is enabled
    if (options.preserveStructure) {
      await this.createZipFolderStructure(zip, folders);
    }

    // Export each note
    for (const note of notes) {
      try {
        onProgress?.({
          current,
          total,
          status: 'processing',
          message: `Exporting: ${note.title}`
        });

        const folder = folders.find(f => f && f.id === note.folderId);
        const exportResult = await this.exportNoteContent(note, folder, options);
        
        // Determine file path in ZIP
        const filePath = options.preserveStructure && folder
          ? this.getFolderPath(folder, folders) + '/' + exportResult.filename
          : exportResult.filename;

        zip.file(filePath, exportResult.content);
        current++;
      } catch (error) {
        console.error(`Failed to export note ${note.title}:`, error);
        // Continue with other notes
      }
    }

    onProgress?.({
      current: total,
      total,
      status: 'complete',
      message: 'Creating archive...'
    });

    // Generate ZIP file
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `devnotes-export-${timestamp}.zip`;

    return {
      content,
      filename,
      mimeType: 'application/zip'
    };
  }

  /**
   * Export complete database as JSON
   */
  async exportDatabase(): Promise<{ content: string; filename: string; mimeType: string }> {
    const result = await databaseService.exportData();
    
    if (!result.success || !result.data) {
      throw new Error('Failed to export database');
    }

    const content = JSON.stringify(result.data, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `devnotes-backup-${timestamp}.json`;

    return {
      content,
      filename,
      mimeType: 'application/json'
    };
  }

  /**
   * Copy note content to clipboard
   */
  async copyToClipboard(noteId: string, format: 'markdown' | 'html' = 'markdown'): Promise<void> {
    const exportResult = await this.exportNote(noteId, { format });
    
    if (format === 'html') {
      // For HTML, copy both HTML and plain text versions
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([exportResult.content], { type: 'text/html' }),
        'text/plain': new Blob([this.stripHTML(exportResult.content)], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
    } else {
      await navigator.clipboard.writeText(exportResult.content);
    }
  }

  /**
   * Generate mailto link for sharing note
   */
  async generateEmailLink(noteId: string, format: 'markdown' | 'html' = 'markdown'): Promise<string> {
    const exportResult = await this.exportNote(noteId, { format });
    const result = await databaseService.getNoteById(noteId);
    
    if (!result.success || !result.data) {
      throw new Error(`Note not found: ${noteId}`);
    }

    const note = result.data;
    const subject = encodeURIComponent(`DevNotes: ${note.title}`);
    const body = encodeURIComponent(exportResult.content);
    
    return `mailto:?subject=${subject}&body=${body}`;
  }

  // Private helper methods

  private async getExportData(options: BulkExportOptions): Promise<{ notes: Note[]; folders: Folder[] }> {
    const [notesResult, foldersResult] = await Promise.all([
      databaseService.getAllNotes(),
      databaseService.getAllFolders()
    ]);

    if (!notesResult.success || !foldersResult.success) {
      throw new Error('Failed to load data for export');
    }

    let notes = notesResult.data || [];
    const folders = foldersResult.data || [];

    // Filter notes based on selection
    if (options.selectedNoteIds?.length) {
      notes = notes.filter(note => note && note.id && options.selectedNoteIds!.includes(note.id));
    } else if (options.selectedFolderIds?.length) {
      const folderIds = options.includeSubfolders 
        ? this.getAllFolderIds(options.selectedFolderIds, folders)
        : options.selectedFolderIds;
      
      notes = notes.filter(note => note && note.folderId && folderIds.includes(note.folderId));
    }

    return { notes, folders };
  }

  private getAllFolderIds(selectedIds: string[], allFolders: Folder[]): string[] {
    const result = new Set(selectedIds);
    
    const addChildren = (folderId: string) => {
      const folder = allFolders.find(f => f.id === folderId);
      if (folder) {
        folder.children.forEach(childId => {
          result.add(childId);
          addChildren(childId);
        });
      }
    };

    selectedIds.forEach(addChildren);
    return Array.from(result);
  }

  private async createZipFolderStructure(zip: any, folders: Folder[]): Promise<void> {
    for (const folder of folders) {
      const path = this.getFolderPath(folder, folders);
      if (path) {
        zip.folder(path);
      }
    }
  }

  private getFolderPath(folder: Folder, allFolders: Folder[]): string {
    const path: string[] = [];
    let current: Folder | undefined = folder;

    while (current) {
      path.unshift(this.sanitizeFilename(current.name));
      current = current.parentId ? allFolders.find(f => f.id === current!.parentId) : undefined;
    }

    return path.join('/');
  }

  private async exportNoteContent(
    note: Note, 
    folder: Folder | undefined, 
    options: ExportOptions
  ): Promise<{ content: string; filename: string }> {
    switch (options.format) {
      case 'markdown':
        return this.exportNoteAsMarkdown(note, folder, options);
      case 'html':
        return this.exportNoteAsHTML(note, folder, options);
      case 'json':
        return this.exportNoteAsJSON(note, folder, options);
      case 'txt':
        return this.exportNoteAsText(note, folder, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private exportNoteAsMarkdown(
    note: Note, 
    folder: Folder | undefined, 
    options: ExportOptions
  ): { content: string; filename: string; mimeType: string } {
    let content = note.content;

    if (options.includeMetadata) {
      const metadata = [
        `# ${note.title}`,
        '',
        `**Created:** ${note.createdAt.toLocaleDateString()}`,
        `**Modified:** ${note.updatedAt.toLocaleDateString()}`,
        `**Folder:** ${folder?.name || 'Unknown'}`,
        `**Word Count:** ${note.wordCount}`,
        `**Reading Time:** ${note.readingTime} min`,
      ];

      if (note.tags?.length) {
        metadata.push(`**Tags:** ${note.tags.join(', ')}`);
      }

      content = metadata.join('\n') + '\n\n---\n\n' + content;
    }

    const filename = this.sanitizeFilename(note.title) + '.md';
    
    return {
      content,
      filename,
      mimeType: 'text/markdown'
    };
  }

  private async exportNoteAsHTML(
    note: Note, 
    folder: Folder | undefined, 
    options: ExportOptions
  ): Promise<{ content: string; filename: string; mimeType: string }> {
    // Import markdown processor
    const { unified } = await import('unified');
    const { default: remarkParse } = await import('remark-parse');
    const { default: remarkRehype } = await import('remark-rehype');
    const { default: rehypeStringify } = await import('rehype-stringify');
    const { default: rehypeHighlight } = await import('rehype-highlight');

    // Process markdown to HTML
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeHighlight)
      .use(rehypeStringify);

    const htmlContent = await processor.process(note.content);

    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHTML(note.title)}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        .metadata { background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .metadata h2 { margin-top: 0; }
        pre { background: #f8f8f8; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { background: #f0f0f0; padding: 0.2rem 0.4rem; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    </style>
</head>
<body>`;

    if (options.includeMetadata) {
      content += `
    <div class="metadata">
        <h2>${this.escapeHTML(note.title)}</h2>
        <p><strong>Created:</strong> ${note.createdAt.toLocaleDateString()}</p>
        <p><strong>Modified:</strong> ${note.updatedAt.toLocaleDateString()}</p>
        <p><strong>Folder:</strong> ${this.escapeHTML(folder?.name || 'Unknown')}</p>
        <p><strong>Word Count:</strong> ${note.wordCount}</p>
        <p><strong>Reading Time:</strong> ${note.readingTime} min</p>`;
      
      if (note.tags?.length) {
        content += `<p><strong>Tags:</strong> ${note.tags.map(tag => this.escapeHTML(tag)).join(', ')}</p>`;
      }
      
      content += `</div>`;
    }

    content += `
    <div class="content">
        ${htmlContent.toString()}
    </div>
</body>
</html>`;

    const filename = this.sanitizeFilename(note.title) + '.html';
    
    return {
      content,
      filename,
      mimeType: 'text/html'
    };
  }

  private exportNoteAsJSON(
    note: Note, 
    folder: Folder | undefined, 
    options: ExportOptions
  ): { content: string; filename: string; mimeType: string } {
    const exportData = {
      note,
      folder: folder ? { id: folder.id, name: folder.name, path: folder.name } : null,
      exportedAt: new Date().toISOString(),
      format: 'json'
    };

    const content = JSON.stringify(exportData, null, 2);
    const filename = this.sanitizeFilename(note.title) + '.json';
    
    return {
      content,
      filename,
      mimeType: 'application/json'
    };
  }

  private exportNoteAsText(
    note: Note, 
    folder: Folder | undefined, 
    options: ExportOptions
  ): { content: string; filename: string; mimeType: string } {
    let content = this.stripMarkdown(note.content);

    if (options.includeMetadata) {
      const metadata = [
        note.title,
        '='.repeat(note.title.length),
        '',
        `Created: ${note.createdAt.toLocaleDateString()}`,
        `Modified: ${note.updatedAt.toLocaleDateString()}`,
        `Folder: ${folder?.name || 'Unknown'}`,
        `Word Count: ${note.wordCount}`,
        `Reading Time: ${note.readingTime} min`,
      ];

      if (note.tags?.length) {
        metadata.push(`Tags: ${note.tags.join(', ')}`);
      }

      content = metadata.join('\n') + '\n\n' + '-'.repeat(50) + '\n\n' + content;
    }

    const filename = this.sanitizeFilename(note.title) + '.txt';
    
    return {
      content,
      filename,
      mimeType: 'text/plain'
    };
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private stripHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private stripMarkdown(markdown: string): string {
    return markdown
      .replace(/```[\s\S]*?```/g, '') // Code blocks (must be first)
      .replace(/^#{1,6}\s+/gm, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      .replace(/^[-*+]\s+/gm, '') // List items
      .replace(/^\d+\.\s+/gm, '') // Numbered lists
      .replace(/^>\s+/gm, '') // Blockquotes
      .replace(/\n{3,}/g, '\n\n'); // Multiple newlines
  }
}

// Singleton instance
export const exportService = new ExportService();