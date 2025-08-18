/**
 * Editor Toolbar Component
 * Provides formatting buttons and editor controls
 * Requirements: 4.1, 4.4
 */

import React from 'react';
import { 
  Bold, 
  Italic, 
  Link, 
  Code, 
  FileCode, 
  Save,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit,
  Split,
  Calculator,
  GitBranch
} from 'lucide-react';
import { Button } from '../ui/button';
import { useUIStore } from '../../stores/uiStore';
import { TooltipWrapper } from '../userGuide/withTooltip';

interface EditorToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onHeading: (level: number) => void;
  onLink: () => void;
  onCode: () => void;
  onCodeBlock: () => void;
  onMath: () => void;
  onMathBlock: () => void;
  onMermaid: () => void;
  onSave: () => void;
  showPreviewControls?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onBold,
  onItalic,
  onHeading,
  onLink,
  onCode,
  onCodeBlock,
  onMath,
  onMathBlock,
  onMermaid,
  onSave,
  showPreviewControls = false
}) => {
  const { saveStatus, panelLayout, setPanelLayout } = useUIStore();

  const getSaveButtonVariant = () => {
    switch (saveStatus) {
      case 'saving':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'unsaved':
        return 'default';
      default:
        return 'ghost';
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Error';
      case 'unsaved':
        return 'Save';
      default:
        return 'Saved';
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-background">
      {/* Text formatting */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <TooltipWrapper tooltipId="editor-toolbar-bold">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBold}
            title="Bold (Ctrl+B)"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        
        <TooltipWrapper tooltipId="editor-toolbar-italic">
          <Button
            variant="ghost"
            size="sm"
            onClick={onItalic}
            title="Italic (Ctrl+I)"
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHeading(1)}
          title="Heading 1"
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHeading(2)}
          title="Heading 2"
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHeading(3)}
          title="Heading 3"
          className="h-8 w-8 p-0"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Links and code */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <TooltipWrapper tooltipId="editor-toolbar-link">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLink}
            title="Link (Ctrl+K)"
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        
        <TooltipWrapper tooltipId="editor-toolbar-code">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCode}
            title="Inline Code"
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        
        <TooltipWrapper tooltipId="editor-toolbar-code">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCodeBlock}
            title="Code Block"
            className="h-8 w-8 p-0"
          >
            <FileCode className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>

      {/* Math and diagrams */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMath}
          title="Inline Math"
          className="h-8 w-8 p-0"
        >
          <Calculator className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onMathBlock}
          title="Math Block"
          className="h-8 w-8 p-0"
        >
          <Calculator className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onMermaid}
          title="Mermaid Diagram"
          className="h-8 w-8 p-0"
        >
          <GitBranch className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview controls */}
      {showPreviewControls && (
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <Button
            variant={panelLayout === 'editor-only' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPanelLayout('editor-only')}
            title="Editor Only"
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <TooltipWrapper tooltipId="editor-split-view">
            <Button
              variant={panelLayout === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPanelLayout('split')}
              title="Split View"
              className="h-8 w-8 p-0"
            >
              <Split className="h-4 w-4" />
            </Button>
          </TooltipWrapper>
          
          <TooltipWrapper tooltipId="editor-preview-toggle">
            <Button
              variant={panelLayout === 'preview-only' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPanelLayout('preview-only')}
              title="Preview Only"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipWrapper>
        </div>
      )}

      {/* Save status */}
      <div className="flex items-center gap-2 ml-auto">
        <TooltipWrapper tooltipId="auto-save-indicator">
          <Button
            variant={getSaveButtonVariant()}
            size="sm"
            onClick={onSave}
            title="Save (Ctrl+S)"
            className="h-8 px-3"
            disabled={saveStatus === 'saving'}
          >
            <Save className="h-4 w-4 mr-1" />
            {getSaveButtonText()}
          </Button>
        </TooltipWrapper>
      </div>
    </div>
  );
};