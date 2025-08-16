/**
 * Unit tests for folder store
 * Tests folder CRUD operations and hierarchy management
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useFolderStore } from '../folderStore';
import { databaseService } from '../../lib/db/DatabaseService';
import { Folder } from '../../types/note';

// Mock the database service
vi.mock('../../lib/db/DatabaseService', () => ({
  databaseService: {
    getAllFolders: vi.fn(),
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn()
  }
}));

const mockDatabaseService = databaseService as any;

describe('folderStore', () => {
  beforeEach(() => {
    // Reset store state
    useFolderStore.setState({
      folders: {},
      selectedFolderId: null,
      expandedFolders: new Set(),
      isLoading: false,
      error: null
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('loadFolders', () => {
    it('should load folders successfully', async () => {
      const mockFolders: Folder[] = [
        {
          id: '1',
          name: 'Root Folder',
          parentId: null,
          children: ['2'],
          notes: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          isExpanded: true
        },
        {
          id: '2',
          name: 'Child Folder',
          parentId: '1',
          children: [],
          notes: ['note1'],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          isExpanded: false
        }
      ];

      mockDatabaseService.getAllFolders.mockResolvedValue({
        success: true,
        data: mockFolders
      });

      const store = useFolderStore.getState();
      await store.loadFolders();

      const state = useFolderStore.getState();
      expect(state.folders).toEqual({
        '1': mockFolders[0],
        '2': mockFolders[1]
      });
      expect(state.expandedFolders.has('1')).toBe(true);
      expect(state.expandedFolders.has('2')).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle load folders error', async () => {
      mockDatabaseService.getAllFolders.mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      const store = useFolderStore.getState();
      await store.loadFolders();

      const state = useFolderStore.getState();
      expect(state.folders).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Database error');
    });
  });

  describe('createFolder', () => {
    it('should create root folder successfully', async () => {
      const mockFolder: Folder = {
        id: 'new-folder',
        name: 'New Folder',
        parentId: null,
        children: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      };

      mockDatabaseService.createFolder.mockResolvedValue({
        success: true,
        data: mockFolder
      });

      const store = useFolderStore.getState();
      const folderId = await store.createFolder(null, 'New Folder');

      expect(folderId).toBe('new-folder');
      
      const state = useFolderStore.getState();
      expect(state.folders['new-folder']).toEqual(mockFolder);
      expect(state.selectedFolderId).toBe('new-folder');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should create child folder and expand parent', async () => {
      // Set up parent folder
      const parentFolder: Folder = {
        id: 'parent',
        name: 'Parent',
        parentId: null,
        children: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      };

      useFolderStore.setState({
        folders: { 'parent': parentFolder }
      });

      const mockChildFolder: Folder = {
        id: 'child',
        name: 'Child Folder',
        parentId: 'parent',
        children: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      };

      mockDatabaseService.createFolder.mockResolvedValue({
        success: true,
        data: mockChildFolder
      });

      // Mock the updateFolder call for expansion
      mockDatabaseService.updateFolder.mockResolvedValue({
        success: true,
        data: { ...parentFolder, isExpanded: true }
      });

      const store = useFolderStore.getState();
      const folderId = await store.createFolder('parent', 'Child Folder');

      expect(folderId).toBe('child');
      
      const state = useFolderStore.getState();
      expect(state.folders['child']).toEqual(mockChildFolder);
      expect(state.expandedFolders.has('parent')).toBe(true);
    });

    it('should handle create folder error', async () => {
      mockDatabaseService.createFolder.mockResolvedValue({
        success: false,
        error: 'Create failed'
      });

      const store = useFolderStore.getState();
      
      await expect(store.createFolder(null, 'New Folder')).rejects.toThrow('Create failed');
      
      const state = useFolderStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Create failed');
    });
  });

  describe('deleteFolder', () => {
    beforeEach(() => {
      const mockFolders: Record<string, Folder> = {
        '1': {
          id: '1',
          name: 'Folder 1',
          parentId: null,
          children: [],
          notes: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          isExpanded: true
        },
        '2': {
          id: '2',
          name: 'Folder 2',
          parentId: null,
          children: [],
          notes: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          isExpanded: false
        }
      };

      useFolderStore.setState({
        folders: mockFolders,
        selectedFolderId: '1',
        expandedFolders: new Set(['1'])
      });
    });

    it('should delete folder successfully', async () => {
      mockDatabaseService.deleteFolder.mockResolvedValue({
        success: true,
        data: true
      });

      const store = useFolderStore.getState();
      await store.deleteFolder('1');

      const state = useFolderStore.getState();
      expect(state.folders['1']).toBeUndefined();
      expect(state.folders['2']).toBeDefined();
      expect(state.selectedFolderId).toBeNull(); // Should clear selection
      expect(state.expandedFolders.has('1')).toBe(false); // Should remove from expanded
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle delete folder error', async () => {
      mockDatabaseService.deleteFolder.mockResolvedValue({
        success: false,
        error: 'Delete failed'
      });

      const store = useFolderStore.getState();
      await store.deleteFolder('1');

      const state = useFolderStore.getState();
      expect(state.folders['1']).toBeDefined(); // Should still exist
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('folder expansion', () => {
    beforeEach(() => {
      const mockFolder: Folder = {
        id: '1',
        name: 'Test Folder',
        parentId: null,
        children: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false
      };

      useFolderStore.setState({
        folders: { '1': mockFolder }
      });

      // Mock the database update call
      mockDatabaseService.updateFolder.mockResolvedValue({
        success: true,
        data: mockFolder
      });
    });

    it('should expand folder', () => {
      const store = useFolderStore.getState();
      store.expandFolder('1');

      const state = useFolderStore.getState();
      expect(state.expandedFolders.has('1')).toBe(true);
      expect(mockDatabaseService.updateFolder).toHaveBeenCalledWith('1', { isExpanded: true });
    });

    it('should collapse folder', () => {
      // Start with expanded folder
      useFolderStore.setState({
        expandedFolders: new Set(['1'])
      });

      const store = useFolderStore.getState();
      store.collapseFolder('1');

      const state = useFolderStore.getState();
      expect(state.expandedFolders.has('1')).toBe(false);
      expect(mockDatabaseService.updateFolder).toHaveBeenCalledWith('1', { isExpanded: false });
    });

    it('should toggle folder expansion', () => {
      const store = useFolderStore.getState();
      
      // Initially collapsed, should expand
      store.toggleFolderExpansion('1');
      let state = useFolderStore.getState();
      expect(state.expandedFolders.has('1')).toBe(true);

      // Now expanded, should collapse
      store.toggleFolderExpansion('1');
      state = useFolderStore.getState();
      expect(state.expandedFolders.has('1')).toBe(false);
    });
  });

  describe('computed getters', () => {
    beforeEach(() => {
      const mockFolders: Record<string, Folder> = {
        'root1': {
          id: 'root1',
          name: 'Root 1',
          parentId: null,
          children: ['child1'],
          notes: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          isExpanded: false
        },
        'root2': {
          id: 'root2',
          name: 'Root 2',
          parentId: null,
          children: [],
          notes: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          isExpanded: false
        },
        'child1': {
          id: 'child1',
          name: 'Child 1',
          parentId: 'root1',
          children: ['grandchild1'],
          notes: [],
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
          isExpanded: false
        },
        'grandchild1': {
          id: 'grandchild1',
          name: 'Grandchild 1',
          parentId: 'child1',
          children: [],
          notes: [],
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04'),
          isExpanded: false
        }
      };

      useFolderStore.setState({ folders: mockFolders });
    });

    it('should get folder by id', () => {
      const store = useFolderStore.getState();
      const folder = store.getFolder('root1');
      
      expect(folder).toBeDefined();
      expect(folder?.name).toBe('Root 1');
    });

    it('should get root folders', () => {
      const store = useFolderStore.getState();
      const rootFolders = store.getRootFolders();
      
      expect(rootFolders).toHaveLength(2);
      expect(rootFolders[0].name).toBe('Root 1'); // Sorted alphabetically
      expect(rootFolders[1].name).toBe('Root 2');
    });

    it('should get child folders', () => {
      const store = useFolderStore.getState();
      const childFolders = store.getChildFolders('root1');
      
      expect(childFolders).toHaveLength(1);
      expect(childFolders[0].name).toBe('Child 1');
    });

    it('should get folder path', () => {
      const store = useFolderStore.getState();
      const path = store.getFolderPath('grandchild1');
      
      expect(path).toEqual(['Root 1', 'Child 1', 'Grandchild 1']);
    });

    it('should check if folder is expanded', () => {
      useFolderStore.setState({
        expandedFolders: new Set(['root1'])
      });

      const store = useFolderStore.getState();
      expect(store.isFolderExpanded('root1')).toBe(true);
      expect(store.isFolderExpanded('root2')).toBe(false);
    });

    it('should get folder hierarchy', () => {
      const store = useFolderStore.getState();
      const hierarchy = store.getFolderHierarchy();
      
      expect(hierarchy).toHaveLength(4);
      expect(hierarchy[0].name).toBe('Root 1');
      expect(hierarchy[1].name).toBe('Child 1');
      expect(hierarchy[2].name).toBe('Grandchild 1');
      expect(hierarchy[3].name).toBe('Root 2');
    });
  });

  describe('state management', () => {
    it('should select folder', () => {
      const store = useFolderStore.getState();
      store.selectFolder('test-folder');
      
      const state = useFolderStore.getState();
      expect(state.selectedFolderId).toBe('test-folder');
    });

    it('should clear error', () => {
      useFolderStore.setState({ error: 'Test error' });
      
      const store = useFolderStore.getState();
      store.clearError();
      
      const state = useFolderStore.getState();
      expect(state.error).toBeNull();
    });
  });
});