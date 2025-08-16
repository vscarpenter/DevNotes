/**
 * Core data model interfaces for notes and folders
 * Requirements: 2.1, 3.1
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  wordCount: number;
  readingTime: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  isExpanded: boolean;
}

// Utility types for note operations
export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime'>;
export type UpdateNoteInput = Partial<Pick<Note, 'title' | 'content' | 'folderId' | 'tags'>>;

// Utility types for folder operations
export type CreateFolderInput = Omit<Folder, 'id' | 'children' | 'notes' | 'createdAt' | 'updatedAt' | 'isExpanded'>;
export type UpdateFolderInput = Partial<Pick<Folder, 'name' | 'parentId' | 'isExpanded'>>;