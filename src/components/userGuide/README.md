# User Guide Tooltip System

The DevNotes tooltip system provides contextual help throughout the application. It consists of several components and utilities that work together to provide accessible, customizable tooltips.

## Components

### UserGuideTooltip

The core tooltip component that handles positioning, timing, and accessibility.

```tsx
import { UserGuideTooltip } from '@/components/userGuide';
import { createTooltipConfig } from '@/lib/userGuide';

const tooltipConfig = createTooltipConfig(
  'my-tooltip',
  'This is helpful information',
  { position: 'bottom', trigger: 'hover', delay: 500 }
);

<UserGuideTooltip config={tooltipConfig}>
  <button>Hover me</button>
</UserGuideTooltip>
```

### TooltipWrapper

A convenience component for adding tooltips without creating a config object.

```tsx
import { TooltipWrapper } from '@/components/userGuide';

<TooltipWrapper
  tooltipContent="Quick tooltip text"
  tooltipPosition="top"
  tooltipTrigger="focus"
>
  <input type="text" placeholder="Focus for help" />
</TooltipWrapper>
```

### withTooltip HOC

A higher-order component for adding tooltip functionality to existing components.

```tsx
import { withTooltip } from '@/components/userGuide';

const MyButton = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

const TooltipButton = withTooltip(MyButton);

<TooltipButton
  tooltipContent="This button does something"
  tooltipPosition="right"
>
  Click me
</TooltipButton>
```

## Tooltip Configuration

### Position Options
- `top` - Tooltip appears above the trigger element
- `bottom` - Tooltip appears below the trigger element
- `left` - Tooltip appears to the left of the trigger element
- `right` - Tooltip appears to the right of the trigger element

### Trigger Options
- `hover` - Show/hide on mouse enter/leave
- `focus` - Show/hide on focus/blur
- `click` - Toggle on click

### Delay
- Configurable delay in milliseconds before showing the tooltip
- Default: 500ms for hover, 300ms for focus, 100ms for click

## Predefined Tooltips

The system includes predefined tooltips for common UI elements:

```tsx
import { TooltipWrapper } from '@/components/userGuide';

// Uses predefined content from tooltipContent.ts
<TooltipWrapper tooltipId="editor-markdown-help">
  <button>Markdown Help</button>
</TooltipWrapper>
```

### Available Predefined Tooltips

#### Editor Tooltips
- `editor-markdown-help` - Markdown syntax help
- `editor-preview-toggle` - Preview mode toggle
- `editor-toolbar-bold` - Bold formatting
- `editor-toolbar-italic` - Italic formatting
- `editor-toolbar-code` - Code formatting
- `editor-toolbar-link` - Link insertion
- `editor-toolbar-list` - List creation

#### Navigation Tooltips
- `folder-create` - Create new folder
- `note-create` - Create new note
- `folder-drag-drop` - Drag and drop functionality
- `note-search` - Search functionality

#### Search Tooltips
- `search-filters` - Search filters
- `search-syntax` - Search syntax help
- `search-recent` - Recent notes

#### Settings Tooltips
- `export-options` - Export functionality
- `import-notes` - Import functionality
- `backup-reminder` - Backup reminders
- `keyboard-shortcuts` - Keyboard shortcuts

## Contextual Tooltips

The system can automatically suggest relevant tooltips based on the current UI state:

```tsx
import { getContextualTooltips } from '@/lib/userGuide';

const relevantTooltips = getContextualTooltips({
  isEditing: true,
  hasNotes: false,
  isSearching: false,
  currentView: 'editor'
});
// Returns: ['editor-markdown-help', 'editor-toolbar-bold', ...]
```

## Accessibility Features

- **ARIA Support**: Tooltips use proper ARIA attributes (`aria-describedby`, `role="tooltip"`)
- **Keyboard Navigation**: Tooltips can be dismissed with the Escape key
- **Focus Management**: Tooltips work with keyboard navigation
- **Screen Reader Support**: Content is properly announced by screen readers

## Positioning System

The tooltip system automatically adjusts positioning to keep tooltips within the viewport:

- Tooltips that would appear outside the viewport are repositioned
- Arrow indicators point to the trigger element
- Responsive positioning works on mobile devices

## Performance Considerations

- **Lazy Loading**: Tooltip content is only rendered when needed
- **Debouncing**: Show/hide actions are debounced to prevent flickering
- **Event Cleanup**: All event listeners are properly cleaned up
- **Memory Management**: No memory leaks from timeout references

## Usage Guidelines

### When to Use Tooltips
- Provide additional context for UI elements
- Explain keyboard shortcuts
- Offer help for complex features
- Guide new users through the interface

### When NOT to Use Tooltips
- For essential information (use visible text instead)
- On mobile devices for hover-only interactions
- For very long explanations (use a help modal instead)
- On elements that are already clearly labeled

### Best Practices
- Keep tooltip text concise and helpful
- Use consistent positioning within related UI areas
- Test with keyboard navigation and screen readers
- Consider mobile users (prefer focus/click triggers)
- Use appropriate delays (shorter for frequently used elements)

## Testing

The tooltip system includes comprehensive tests:

```bash
# Run tooltip-specific tests
npm test src/lib/userGuide/__tests__/
npm test src/hooks/__tests__/useTooltip.test.ts
npm test src/components/userGuide/__tests__/
```

Tests cover:
- Component rendering and behavior
- Accessibility features
- Positioning logic
- Event handling
- Content management
- Performance characteristics