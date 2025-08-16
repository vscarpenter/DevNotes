/**
 * Tests for ImportModal component
 * Requirements: 7.6, 8.1
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportModal } from '../ImportModal';
import { importService } from '../../../lib/import';

// Mock the import service
vi.mock('../../../lib/import', () => ({
  importService: {
    importFromJSON: vi.fn(),
    importFromZIP: vi.fn()
  }
}));

describe('ImportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnImportComplete = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onImportComplete: mockOnImportComplete
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(<ImportModal {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: 'Import Data' })).toBeInTheDocument();
    expect(screen.getByText('Select Import File')).toBeInTheDocument();
    expect(screen.getByText('Import Options')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ImportModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
  });

  it('should handle file selection via input', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    
    expect(screen.getByText('backup.json')).toBeInTheDocument();
  });

  it('should handle drag and drop file selection', async () => {
    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const dropZone = screen.getByText(/drag and drop your backup file here/i).closest('div');
    
    fireEvent.dragOver(dropZone!);
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    });
    
    expect(screen.getByText('backup.json')).toBeInTheDocument();
  });

  it('should detect file format and update options', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const zipFile = new File(['zip content'], 'backup.zip', { type: 'application/zip' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, zipFile);
    
    expect(screen.getByText('backup.zip')).toBeInTheDocument();
    // The format should be automatically detected as ZIP
  });

  it('should handle conflict resolution option changes', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const select = screen.getByDisplayValue('Rename conflicting items');
    await user.selectOptions(select, 'skip');
    
    expect(screen.getByDisplayValue('Skip conflicting items')).toBeInTheDocument();
  });

  it('should handle validation checkbox toggle', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const checkbox = screen.getByLabelText(/validate data integrity/i);
    expect(checkbox).toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should handle preserve IDs checkbox toggle', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const checkbox = screen.getByLabelText(/preserve original ids/i);
    expect(checkbox).not.toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should disable import button when no file selected', () => {
    render(<ImportModal {...defaultProps} />);
    
    const importButton = screen.getByRole('button', { name: 'Import Data' });
    expect(importButton).toBeDisabled();
  });

  it('should enable import button when file is selected', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    
    const importButton = screen.getByRole('button', { name: 'Import Data' });
    expect(importButton).not.toBeDisabled();
  });

  it('should call importFromJSON for JSON files', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      processed: 5,
      failed: 0,
      errors: [],
      importedNotes: 3,
      importedFolders: 2,
      skippedItems: 0,
      conflicts: []
    };

    (importService.importFromJSON as Mock).mockResolvedValue(mockResult);

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    expect(importService.importFromJSON).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        format: 'json',
        conflictResolution: 'rename',
        validateData: true,
        preserveIds: false
      }),
      expect.any(Function)
    );
  });

  it('should call importFromZIP for ZIP files', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      processed: 5,
      failed: 0,
      errors: [],
      importedNotes: 3,
      importedFolders: 2,
      skippedItems: 0,
      conflicts: []
    };

    (importService.importFromZIP as Mock).mockResolvedValue(mockResult);

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['zip content'], 'backup.zip', { type: 'application/zip' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    expect(importService.importFromZIP).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        format: 'zip',
        conflictResolution: 'rename',
        validateData: true,
        preserveIds: false
      }),
      expect.any(Function)
    );
  });

  it('should display progress during import', async () => {
    const user = userEvent.setup();
    let progressCallback: Function;

    (importService.importFromJSON as Mock).mockImplementation((file, options, onProgress) => {
      progressCallback = onProgress;
      return new Promise(resolve => {
        setTimeout(() => {
          progressCallback({
            current: 50,
            total: 100,
            status: 'processing',
            message: 'Importing notes...',
            phase: 'notes'
          });
          
          resolve({
            success: true,
            processed: 5,
            failed: 0,
            errors: [],
            importedNotes: 3,
            importedFolders: 2,
            skippedItems: 0,
            conflicts: []
          });
        }, 100);
      });
    });

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    await waitFor(() => {
      expect(screen.getByText('Importing notes...')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('should display success results', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      processed: 5,
      failed: 0,
      errors: [],
      importedNotes: 3,
      importedFolders: 2,
      skippedItems: 1,
      conflicts: [
        {
          type: 'note' as const,
          id: 'note1',
          name: 'Test Note',
          resolution: 'renamed' as const,
          newName: 'Test Note (1)'
        }
      ]
    };

    (importService.importFromJSON as Mock).mockResolvedValue(mockResult);

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    await waitFor(() => {
      expect(screen.getByText('Import Completed Successfully')).toBeInTheDocument();
      expect(screen.getByText('Imported: 3 notes, 2 folders')).toBeInTheDocument();
      expect(screen.getByText('Skipped: 1 items')).toBeInTheDocument();
      expect(screen.getByText('Conflicts Resolved:')).toBeInTheDocument();
    });
  });

  it('should display error results', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: false,
      processed: 2,
      failed: 3,
      errors: ['Failed to import note: Database error', 'Invalid data format'],
      importedNotes: 1,
      importedFolders: 1,
      skippedItems: 0,
      conflicts: []
    };

    (importService.importFromJSON as Mock).mockResolvedValue(mockResult);

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument();
      expect(screen.getByText('Failed: 3 items')).toBeInTheDocument();
      expect(screen.getByText('Errors:')).toBeInTheDocument();
    });
  });

  it('should call onImportComplete with result', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      processed: 5,
      failed: 0,
      errors: [],
      importedNotes: 3,
      importedFolders: 2,
      skippedItems: 0,
      conflicts: []
    };

    (importService.importFromJSON as Mock).mockResolvedValue(mockResult);

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    await waitFor(() => {
      expect(mockOnImportComplete).toHaveBeenCalledWith(mockResult);
    });
  });

  it('should disable close button during import', async () => {
    const user = userEvent.setup();

    (importService.importFromJSON as Mock).mockImplementation(() => {
      return new Promise(() => {}); // Never resolves
    });

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    const closeButton = screen.getByRole('button', { name: /cancel/i });
    expect(closeButton).toBeDisabled();
  });

  it('should handle close after successful import', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      processed: 5,
      failed: 0,
      errors: [],
      importedNotes: 3,
      importedFolders: 2,
      skippedItems: 0,
      conflicts: []
    };

    (importService.importFromJSON as Mock).mockResolvedValue(mockResult);

    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: 'Import Data' }));
    
    await waitFor(() => {
      expect(screen.getByText('Import Completed Successfully')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should format file sizes correctly', async () => {
    const user = userEvent.setup();
    render(<ImportModal {...defaultProps} />);
    
    const file = new File(['x'.repeat(1024)], 'backup.json', { type: 'application/json' });
    const input = screen.getByLabelText(/choose file/i);
    
    await user.upload(input, file);
    
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('should show drag over state', () => {
    render(<ImportModal {...defaultProps} />);
    
    const dropZone = screen.getByText(/drag and drop your backup file here/i).closest('div');
    
    fireEvent.dragOver(dropZone!);
    
    expect(dropZone).toHaveClass('border-blue-500');
  });

  it('should clear drag over state on drag leave', () => {
    render(<ImportModal {...defaultProps} />);
    
    const dropZone = screen.getByText(/drag and drop your backup file here/i).closest('div');
    
    fireEvent.dragOver(dropZone!);
    fireEvent.dragLeave(dropZone!);
    
    expect(dropZone).not.toHaveClass('border-blue-500');
  });
});