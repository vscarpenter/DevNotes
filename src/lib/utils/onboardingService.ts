/**
 * Onboarding service for managing new user guided tours
 * Requirements: 10.1, 10.2
 */

import { OnboardingStep } from '../../components/ui/onboarding';

const ONBOARDING_STORAGE_KEY = 'devnotes-onboarding';

export interface OnboardingState {
  hasCompletedTour: boolean;
  hasSeenWelcome: boolean;
  completedSteps: string[];
  lastTourDate: Date | null;
}

const DEFAULT_STATE: OnboardingState = {
  hasCompletedTour: false,
  hasSeenWelcome: false,
  completedSteps: [],
  lastTourDate: null
};

export class OnboardingService {
  private state: OnboardingState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): OnboardingState {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          lastTourDate: parsed.lastTourDate ? new Date(parsed.lastTourDate) : null
        };
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    }
    return { ...DEFAULT_STATE };
  }

  private saveState(): void {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }

  public getState(): OnboardingState {
    return { ...this.state };
  }

  public shouldShowWelcome(): boolean {
    return !this.state.hasSeenWelcome && !this.state.hasCompletedTour;
  }

  public shouldShowTour(): boolean {
    return !this.state.hasCompletedTour;
  }

  public markWelcomeSeen(): void {
    this.state.hasSeenWelcome = true;
    this.saveState();
  }

  public markTourCompleted(): void {
    this.state.hasCompletedTour = true;
    this.state.lastTourDate = new Date();
    this.saveState();
  }

  public markStepCompleted(stepId: string): void {
    if (!this.state.completedSteps.includes(stepId)) {
      this.state.completedSteps.push(stepId);
      this.saveState();
    }
  }

  public resetOnboarding(): void {
    this.state = { ...DEFAULT_STATE };
    this.saveState();
  }

  public getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        id: 'welcome',
        title: 'Welcome to DevNotes',
        content: 'DevNotes is your personal note-taking app designed for developers. Let\'s explore the main features!',
        target: '[data-onboarding="app-layout"]',
        position: 'bottom'
      },
      {
        id: 'sidebar',
        title: 'Navigation Sidebar',
        content: 'This sidebar contains your folder tree and search. You can resize it by dragging the divider.',
        target: '[data-onboarding="sidebar"]',
        position: 'right'
      },
      {
        id: 'create-folder',
        title: 'Create Your First Folder',
        content: 'Organize your notes by creating folders. Right-click in the sidebar or use the + button.',
        target: '[data-onboarding="folder-tree"]',
        position: 'right',
        action: {
          label: 'Create Sample Folder',
          onClick: () => {
            // This will be implemented by the component using the service
            window.dispatchEvent(new CustomEvent('onboarding:create-folder'));
          }
        }
      },
      {
        id: 'create-note',
        title: 'Create Your First Note',
        content: 'Click the + button or use Ctrl+N to create a new note in the selected folder.',
        target: '[data-onboarding="note-list"]',
        position: 'right',
        action: {
          label: 'Create Sample Note',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('onboarding:create-note'));
          }
        }
      },
      {
        id: 'editor',
        title: 'Markdown Editor',
        content: 'Write your notes in Markdown format. The editor supports syntax highlighting, math expressions, and diagrams.',
        target: '[data-onboarding="editor"]',
        position: 'left'
      },
      {
        id: 'preview',
        title: 'Live Preview',
        content: 'Toggle the preview pane to see how your markdown will look. You can also use split view to see both at once.',
        target: '[data-onboarding="preview-toggle"]',
        position: 'bottom'
      },
      {
        id: 'search',
        title: 'Search Your Notes',
        content: 'Use Ctrl+K to quickly search across all your notes. The search supports fuzzy matching and filters.',
        target: '[data-onboarding="search-button"]',
        position: 'bottom',
        action: {
          label: 'Try Search',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('onboarding:open-search'));
          }
        }
      },
      {
        id: 'auto-save',
        title: 'Auto-Save',
        content: 'Your notes are automatically saved as you type. Look for the save indicator in the editor toolbar.',
        target: '[data-onboarding="save-status"]',
        position: 'bottom'
      },
      {
        id: 'export',
        title: 'Export & Backup',
        content: 'Export your notes in various formats or create backups. Access these options from the main menu.',
        target: '[data-onboarding="menu-button"]',
        position: 'bottom'
      },
      {
        id: 'complete',
        title: 'You\'re All Set!',
        content: 'You\'ve completed the tour! Start creating notes and organizing your knowledge. You can always access help from the settings menu.',
        target: '[data-onboarding="app-layout"]',
        position: 'bottom'
      }
    ];
  }

  public getQuickStartSteps(): OnboardingStep[] {
    return [
      {
        id: 'quick-folder',
        title: 'Create a Folder',
        content: 'Let\'s start by creating your first folder to organize your notes.',
        target: '[data-onboarding="folder-tree"]',
        position: 'right',
        action: {
          label: 'Create Folder',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('onboarding:create-folder'));
          }
        }
      },
      {
        id: 'quick-note',
        title: 'Create a Note',
        content: 'Now let\'s create your first note in this folder.',
        target: '[data-onboarding="note-list"]',
        position: 'right',
        action: {
          label: 'Create Note',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('onboarding:create-note'));
          }
        }
      },
      {
        id: 'quick-edit',
        title: 'Start Writing',
        content: 'You can now start writing in Markdown format. Try typing some text and see the auto-save in action!',
        target: '[data-onboarding="editor"]',
        position: 'left'
      }
    ];
  }

  public getDaysUntilRetour(): number | null {
    if (!this.state.lastTourDate) return null;
    
    const now = new Date();
    const daysSinceTour = Math.floor(
      (now.getTime() - this.state.lastTourDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Suggest retour after 30 days
    return Math.max(0, 30 - daysSinceTour);
  }

  public shouldSuggestRetour(): boolean {
    const days = this.getDaysUntilRetour();
    return days !== null && days <= 0;
  }
}

// Singleton instance
export const onboardingService = new OnboardingService();