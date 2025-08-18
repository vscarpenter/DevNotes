/**
 * IndexedDB service layer using Dexie
 * Provides CRUD operations for notes and folders with error handling
 * Requirements: 7.1, 7.4, 7.6
 */

import Dexie, { type Table } from 'dexie';
import { 
  Note, 
  Folder, 
  Tag,
  CreateNoteInput, 
  UpdateNoteInput, 
  CreateFolderInput, 
  UpdateFolderInput,
  DatabaseResult,
  BulkOperationResult,
  ExportData,
  SearchIndex
} from '../../types';

export class DatabaseService extends Dexie {
  notes!: Table<Note>;
  folders!: Table<Folder>;
  tags!: Table<Tag>;
  settings!: Table<{ key: string; value: any }>;
  searchIndex!: Table<SearchIndex>;

  constructor() {
    super('DevNotesDB');
    
    // Define database schema
    this.version(1).stores({
      notes: '++id, title, content, folderId, createdAt, updatedAt, [folderId+updatedAt]',
      folders: '++id, name, parentId, createdAt, updatedAt, [parentId+name]',
      tags: '++id, name, color, createdAt, usageCount',
      settings: '++key, value',
      searchIndex: '++noteId, lastIndexed'
    });

    // Add hooks for automatic timestamp updates
    this.notes.hook('creating', (_primKey, obj: any, _trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
    });

    this.notes.hook('updating', (modifications: any, _primKey, _obj, _trans) => {
      modifications.updatedAt = new Date();
    });

    this.folders.hook('creating', (_primKey, obj: any, _trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.updatedAt = now;
      obj.children = obj.children || [];
      obj.notes = obj.notes || [];
      obj.isExpanded = obj.isExpanded ?? false;
    });

    this.folders.hook('updating', (modifications: any, _primKey, _obj, _trans) => {
      modifications.updatedAt = new Date();
    });

    this.tags.hook('creating', (_primKey, obj: any, _trans) => {
      const now = new Date();
      obj.createdAt = now;
      obj.usageCount = obj.usageCount || 0;
    });
  }

  // Note CRUD Operations
  async createNote(noteInput: CreateNoteInput): Promise<DatabaseResult<Note>> {
    try {
      const noteId = await this.transaction('rw', this.notes, this.folders, async () => {
        // Calculate word count and reading time
        const wordCount = this.calculateWordCount(noteInput.content);
        const readingTime = this.calculateReadingTime(wordCount);

        const note: Omit<Note, 'id'> = {
          ...noteInput,
          wordCount,
          readingTime,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const id = await this.notes.add(note as Note);
        
        // Update parent folder's notes array
        if (noteInput.folderId) {
          await this.addNoteToFolder(noteInput.folderId, id as string);
        }

        return id as string;
      });

      const createdNote = await this.notes.get(noteId);
      return { success: true, data: createdNote };
    } catch (error) {
      return this.handleDatabaseError('createNote', error);
    }
  }

  async getNoteById(id: string): Promise<DatabaseResult<Note>> {
    try {
      const note = await this.notes.get(id);
      return { success: true, data: note };
    } catch (error) {
      return this.handleDatabaseError('getNoteById', error);
    }
  }

  async updateNote(id: string, updates: UpdateNoteInput): Promise<DatabaseResult<Note>> {
    try {
      const updatedNote = await this.transaction('rw', this.notes, this.folders, async () => {
        const existingNote = await this.notes.get(id);
        if (!existingNote) {
          throw new Error(`Note with id ${id} not found`);
        }

        // Handle folder change
        if (updates.folderId && updates.folderId !== existingNote.folderId) {
          await this.removeNoteFromFolder(existingNote.folderId, id);
          await this.addNoteToFolder(updates.folderId, id);
        }

        // Calculate new word count and reading time if content changed
        const updatedData: Partial<Note> = { ...updates };
        if (updates.content !== undefined) {
          updatedData.wordCount = this.calculateWordCount(updates.content);
          updatedData.readingTime = this.calculateReadingTime(updatedData.wordCount);
        }

        await this.notes.update(id, updatedData);
        return await this.notes.get(id);
      });

      return { success: true, data: updatedNote };
    } catch (error) {
      return this.handleDatabaseError('updateNote', error);
    }
  }

  async deleteNote(id: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.transaction('rw', this.notes, this.folders, this.searchIndex, async () => {
        const note = await this.notes.get(id);
        if (!note) {
          throw new Error(`Note with id ${id} not found`);
        }

        // Remove from parent folder
        await this.removeNoteFromFolder(note.folderId, id);
        
        // Delete the note
        await this.notes.delete(id);
        
        // Clean up search index
        await this.searchIndex.delete(id);
      });

      return { success: true, data: true };
    } catch (error) {
      return this.handleDatabaseError('deleteNote', error);
    }
  }

  async getNotesByFolder(folderId: string): Promise<DatabaseResult<Note[]>> {
    try {
      const notes = await this.notes
        .where('folderId')
        .equals(folderId)
        .toArray();
      
      // Sort by updatedAt in descending order
      notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      return { success: true, data: notes };
    } catch (error) {
      return this.handleDatabaseError('getNotesByFolder', error);
    }
  }

  async getAllNotes(): Promise<DatabaseResult<Note[]>> {
    try {
      const notes = await this.notes.toArray();
      
      // Sort by updatedAt in descending order
      notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      return { success: true, data: notes };
    } catch (error) {
      return this.handleDatabaseError('getAllNotes', error);
    }
  }

  // Folder CRUD Operations
  async createFolder(folderInput: CreateFolderInput): Promise<DatabaseResult<Folder>> {
    try {
      const folderId = await this.transaction('rw', this.folders, async () => {
        const folder: Omit<Folder, 'id'> = {
          ...folderInput,
          children: [],
          notes: [],
          isExpanded: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const id = await this.folders.add(folder as Folder);
        
        // Update parent folder's children array
        if (folderInput.parentId) {
          await this.addChildToFolder(folderInput.parentId, id as string);
        }

        return id as string;
      });

      const createdFolder = await this.folders.get(folderId);
      return { success: true, data: createdFolder };
    } catch (error) {
      return this.handleDatabaseError('createFolder', error);
    }
  }

  async getFolderById(id: string): Promise<DatabaseResult<Folder>> {
    try {
      const folder = await this.folders.get(id);
      return { success: true, data: folder };
    } catch (error) {
      return this.handleDatabaseError('getFolderById', error);
    }
  }

  async updateFolder(id: string, updates: UpdateFolderInput): Promise<DatabaseResult<Folder>> {
    try {
      const updatedFolder = await this.transaction('rw', this.folders, async () => {
        const existingFolder = await this.folders.get(id);
        if (!existingFolder) {
          throw new Error(`Folder with id ${id} not found`);
        }

        // Handle parent change
        if (updates.parentId !== undefined && updates.parentId !== existingFolder.parentId) {
          // Remove from old parent
          if (existingFolder.parentId) {
            await this.removeChildFromFolder(existingFolder.parentId, id);
          }
          
          // Add to new parent
          if (updates.parentId) {
            await this.addChildToFolder(updates.parentId, id);
          }
        }

        await this.folders.update(id, updates);
        return await this.folders.get(id);
      });

      return { success: true, data: updatedFolder };
    } catch (error) {
      return this.handleDatabaseError('updateFolder', error);
    }
  }

  async deleteFolder(id: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.transaction('rw', this.folders, this.notes, this.searchIndex, async () => {
        const folder = await this.folders.get(id);
        if (!folder) {
          throw new Error(`Folder with id ${id} not found`);
        }

        // Recursively delete all child folders and notes
        await this.deleteFolderRecursive(folder);
        
        // Remove from parent folder
        if (folder.parentId) {
          await this.removeChildFromFolder(folder.parentId, id);
        }
      });

      return { success: true, data: true };
    } catch (error) {
      return this.handleDatabaseError('deleteFolder', error);
    }
  }

  async getAllFolders(): Promise<DatabaseResult<Folder[]>> {
    try {
      const folders = await this.folders.toArray();
      
      // Sort by name
      folders.sort((a, b) => a.name.localeCompare(b.name));
      
      return { success: true, data: folders };
    } catch (error) {
      return this.handleDatabaseError('getAllFolders', error);
    }
  }

  async getRootFolders(): Promise<DatabaseResult<Folder[]>> {
    try {
      const folders = await this.folders
        .where('parentId')
        .equals(null as any)
        .toArray();
      
      // Sort by name
      folders.sort((a, b) => a.name.localeCompare(b.name));
      
      return { success: true, data: folders };
    } catch (error) {
      return this.handleDatabaseError('getRootFolders', error);
    }
  }

  async getChildFolders(parentId: string): Promise<DatabaseResult<Folder[]>> {
    try {
      const folders = await this.folders
        .where('parentId')
        .equals(parentId)
        .toArray();
      
      // Sort by name
      folders.sort((a, b) => a.name.localeCompare(b.name));
      
      return { success: true, data: folders };
    } catch (error) {
      return this.handleDatabaseError('getChildFolders', error);
    }
  }

  // Tag CRUD Operations
  async createTag(tagInput: Omit<Tag, 'id' | 'createdAt'>): Promise<DatabaseResult<Tag>> {
    try {
      const tagId = await this.transaction('rw', this.tags, async () => {
        const tag: Omit<Tag, 'id'> = {
          ...tagInput,
          createdAt: new Date()
        };

        const id = await this.tags.add(tag as Tag);
        return id as string;
      });

      const createdTag = await this.tags.get(tagId);
      return { success: true, data: createdTag };
    } catch (error) {
      return this.handleDatabaseError('createTag', error);
    }
  }

  async getTagById(id: string): Promise<DatabaseResult<Tag>> {
    try {
      const tag = await this.tags.get(id);
      return { success: true, data: tag };
    } catch (error) {
      return this.handleDatabaseError('getTagById', error);
    }
  }

  async updateTag(id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>): Promise<DatabaseResult<Tag>> {
    try {
      const updatedTag = await this.transaction('rw', this.tags, async () => {
        const existingTag = await this.tags.get(id);
        if (!existingTag) {
          throw new Error(`Tag with id ${id} not found`);
        }

        await this.tags.update(id, updates);
        return await this.tags.get(id);
      });

      return { success: true, data: updatedTag };
    } catch (error) {
      return this.handleDatabaseError('updateTag', error);
    }
  }

  async deleteTag(id: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.transaction('rw', this.tags, this.notes, async () => {
        const tag = await this.tags.get(id);
        if (!tag) {
          throw new Error(`Tag with id ${id} not found`);
        }

        // Remove tag from all notes
        const allNotes = await this.notes.toArray();
        for (const note of allNotes) {
          if (note.tags && note.tags.includes(id)) {
            const updatedTags = note.tags.filter(tagId => tagId !== id);
            await this.notes.update(note.id, { tags: updatedTags });
          }
        }

        // Delete the tag
        await this.tags.delete(id);
      });

      return { success: true, data: true };
    } catch (error) {
      return this.handleDatabaseError('deleteTag', error);
    }
  }

  async getAllTags(): Promise<DatabaseResult<Tag[]>> {
    try {
      const tags = await this.tags.toArray();
      
      // Sort by name
      tags.sort((a, b) => a.name.localeCompare(b.name));
      
      return { success: true, data: tags };
    } catch (error) {
      return this.handleDatabaseError('getAllTags', error);
    }
  }

  async updateTagUsageCounts(): Promise<DatabaseResult<Tag[]>> {
    try {
      const updatedTags = await this.transaction('rw', this.tags, this.notes, async () => {
        const allNotes = await this.notes.toArray();
        const tagUsage = new Map<string, number>();

        // Count tag usage
        for (const note of allNotes) {
          if (note.tags) {
            for (const tagId of note.tags) {
              tagUsage.set(tagId, (tagUsage.get(tagId) || 0) + 1);
            }
          }
        }

        // Update tag usage counts
        const allTags = await this.tags.toArray();
        const updatedTags: Tag[] = [];

        for (const tag of allTags) {
          const usageCount = tagUsage.get(tag.id) || 0;
          if (tag.usageCount !== usageCount) {
            await this.tags.update(tag.id, { usageCount });
            updatedTags.push({ ...tag, usageCount });
          }
        }

        return updatedTags;
      });

      return { success: true, data: updatedTags };
    } catch (error) {
      return this.handleDatabaseError('updateTagUsageCounts', error);
    }
  }

  // Bulk Operations
  async exportData(): Promise<DatabaseResult<ExportData>> {
    try {
      const [notes, folders, tags, settings] = await Promise.all([
        this.notes.toArray(),
        this.folders.toArray(),
        this.tags.toArray(),
        this.settings.toArray()
      ]);

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date(),
        notes,
        folders,
        tags,
        settings: settingsMap,
        metadata: {
          totalNotes: notes.length,
          totalFolders: folders.length,
          totalTags: tags.length,
          exportFormat: 'json'
        }
      };

      return { success: true, data: exportData };
    } catch (error) {
      return this.handleDatabaseError('exportData', error);
    }
  }

  async importData(data: ExportData): Promise<BulkOperationResult> {
    try {
      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      await this.transaction('rw', this.notes, this.folders, this.tags, this.settings, async () => {
        // Clear existing data
        await this.notes.clear();
        await this.folders.clear();
        await this.tags.clear();
        await this.settings.clear();

        // Import folders first (to maintain hierarchy)
        for (const folder of data.folders) {
          try {
            await this.folders.add(folder);
            processed++;
          } catch (error) {
            failed++;
            errors.push(`Failed to import folder ${folder.name}: ${error}`);
          }
        }

        // Import tags
        if (data.tags) {
          for (const tag of data.tags) {
            try {
              await this.tags.add(tag);
              processed++;
            } catch (error) {
              failed++;
              errors.push(`Failed to import tag ${tag.name}: ${error}`);
            }
          }
        }

        // Import notes
        for (const note of data.notes) {
          try {
            await this.notes.add(note);
            processed++;
          } catch (error) {
            failed++;
            errors.push(`Failed to import note ${note.title}: ${error}`);
          }
        }

        // Import settings
        for (const [key, value] of Object.entries(data.settings)) {
          try {
            await this.settings.add({ key, value });
            processed++;
          } catch (error) {
            failed++;
            errors.push(`Failed to import setting ${key}: ${error}`);
          }
        }
      });

      return {
        success: errors.length === 0,
        processed,
        failed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [`Import failed: ${error}`]
      };
    }
  }

  // Helper Methods
  private async addNoteToFolder(folderId: string, noteId: string): Promise<void> {
    const folder = await this.folders.get(folderId);
    if (folder) {
      const updatedNotes = [...folder.notes, noteId];
      await this.folders.update(folderId, { notes: updatedNotes });
    }
  }

  private async removeNoteFromFolder(folderId: string, noteId: string): Promise<void> {
    const folder = await this.folders.get(folderId);
    if (folder) {
      const updatedNotes = folder.notes.filter(id => id !== noteId);
      await this.folders.update(folderId, { notes: updatedNotes });
    }
  }

  private async addChildToFolder(parentId: string, childId: string): Promise<void> {
    const parent = await this.folders.get(parentId);
    if (parent) {
      const updatedChildren = [...parent.children, childId];
      await this.folders.update(parentId, { children: updatedChildren });
    }
  }

  private async removeChildFromFolder(parentId: string, childId: string): Promise<void> {
    const parent = await this.folders.get(parentId);
    if (parent) {
      const updatedChildren = parent.children.filter(id => id !== childId);
      await this.folders.update(parentId, { children: updatedChildren });
    }
  }

  private async deleteFolderRecursive(folder: Folder): Promise<void> {
    // Delete all notes in this folder
    for (const noteId of folder.notes) {
      await this.notes.delete(noteId);
      await this.searchIndex.delete(noteId);
    }

    // Recursively delete child folders
    for (const childId of folder.children) {
      const childFolder = await this.folders.get(childId);
      if (childFolder) {
        await this.deleteFolderRecursive(childFolder);
      }
    }

    // Delete the folder itself
    await this.folders.delete(folder.id);
  }

  public calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  public calculateReadingTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200);
  }

  public handleDatabaseError(operation: string, error: any): DatabaseResult<any> {
    console.error(`Database operation failed: ${operation}`, error);
    
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
}

// Singleton instance
export const databaseService = new DatabaseService();