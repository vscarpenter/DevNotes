/**
 * Note templates service for creating pre-formatted notes
 * Requirements: 2.1, 4.1
 */

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  tags?: string[];
  icon?: string;
}

export const DEFAULT_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Note',
    description: 'Start with a clean slate',
    category: 'Basic',
    content: '',
    icon: '📄'
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for meeting notes and action items',
    category: 'Work',
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
**Duration:** 

## Agenda
- 

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 

## Next Steps
- 

## Notes
`,
    tags: ['meeting', 'work'],
    icon: '📝'
  },
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    description: 'Daily standup meeting template',
    category: 'Work',
    content: `# Daily Standup - ${new Date().toLocaleDateString()}

## What I did yesterday
- 

## What I'm working on today
- 

## Blockers/Issues
- 

## Notes
`,
    tags: ['standup', 'daily', 'work'],
    icon: '🏃'
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Template for project planning and requirements',
    category: 'Work',
    content: `# Project Planning

## Project Overview
**Project Name:** 
**Start Date:** 
**End Date:** 
**Team Members:** 

## Objectives
- 

## Requirements
### Functional Requirements
- 

### Non-Functional Requirements
- 

## Timeline
| Phase | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
|       |             |          |              |

## Risks & Mitigation
- **Risk:** 
  - **Mitigation:** 

## Resources
- 

## Success Criteria
- 
`,
    tags: ['project', 'planning', 'work'],
    icon: '📋'
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Template for documenting bugs and issues',
    category: 'Development',
    content: `# Bug Report

**Date:** ${new Date().toLocaleDateString()}
**Reporter:** 
**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low
**Status:** [ ] Open [ ] In Progress [ ] Resolved [ ] Closed

## Summary
Brief description of the bug

## Environment
- **OS:** 
- **Browser:** 
- **Version:** 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots/Logs
\`\`\`
Paste logs or error messages here
\`\`\`

## Additional Notes
`,
    tags: ['bug', 'development', 'issue'],
    icon: '🐛'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Template for code review notes',
    category: 'Development',
    content: `# Code Review

**PR/MR:** 
**Author:** 
**Reviewer:** 
**Date:** ${new Date().toLocaleDateString()}

## Summary
Brief description of changes

## Files Reviewed
- [ ] \`file1.js\`
- [ ] \`file2.js\`

## Feedback

### Positive
- 

### Issues Found
- [ ] **Critical:** 
- [ ] **Major:** 
- [ ] **Minor:** 

### Suggestions
- 

## Overall Assessment
- [ ] Approve
- [ ] Approve with minor changes
- [ ] Request changes
- [ ] Needs major revision

## Notes
`,
    tags: ['code-review', 'development'],
    icon: '👀'
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    description: 'Template for API endpoint documentation',
    category: 'Development',
    content: `# API Documentation

## Endpoint: \`METHOD /api/endpoint\`

### Description
Brief description of what this endpoint does

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1    | string | Yes | Description |
| param2    | number | No | Description |

### Request Example
\`\`\`json
{
  "param1": "value",
  "param2": 123
}
\`\`\`

### Response Example
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example"
  }
}
\`\`\`

### Error Responses
| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

### Notes
`,
    tags: ['api', 'documentation', 'development'],
    icon: '📡'
  },
  {
    id: 'learning-notes',
    name: 'Learning Notes',
    description: 'Template for study and learning notes',
    category: 'Education',
    content: `# Learning Notes: [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Source:** 
**Duration:** 

## Key Concepts
- **Concept 1:** Definition and explanation
- **Concept 2:** Definition and explanation

## Important Points
- 
- 

## Examples
\`\`\`
Code or examples here
\`\`\`

## Questions
- [ ] Question 1
- [ ] Question 2

## Action Items
- [ ] Practice exercise 1
- [ ] Read additional resource
- [ ] Review in 1 week

## Summary
Brief summary of what was learned

## Related Topics
- 
- 
`,
    tags: ['learning', 'study', 'notes'],
    icon: '📚'
  },
  {
    id: 'research-notes',
    name: 'Research Notes',
    description: 'Template for research and investigation',
    category: 'Research',
    content: `# Research Notes: [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Research Question:** 
**Methodology:** 

## Background
Context and background information

## Sources
1. [Source 1](url) - Brief description
2. [Source 2](url) - Brief description

## Key Findings
- **Finding 1:** Description and implications
- **Finding 2:** Description and implications

## Data/Evidence
| Source | Data Point | Reliability |
|--------|------------|-------------|
|        |            |             |

## Analysis
Interpretation of findings

## Conclusions
- 
- 

## Next Steps
- [ ] Additional research needed
- [ ] Verify findings
- [ ] Apply insights

## References
- 
- 
`,
    tags: ['research', 'investigation'],
    icon: '🔍'
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    description: 'Template for team retrospectives',
    category: 'Work',
    content: `# Retrospective - ${new Date().toLocaleDateString()}

**Sprint/Period:** 
**Team:** 
**Facilitator:** 

## What Went Well? 👍
- 
- 

## What Could Be Improved? 🤔
- 
- 

## What Should We Stop Doing? 🛑
- 
- 

## What Should We Start Doing? 🚀
- 
- 

## Action Items
- [ ] **Action 1** - Owner: [Name] - Due: [Date]
- [ ] **Action 2** - Owner: [Name] - Due: [Date]

## Metrics
- **Velocity:** 
- **Burndown:** 
- **Team Satisfaction:** /10

## Notes
`,
    tags: ['retrospective', 'team', 'agile'],
    icon: '🔄'
  },
  {
    id: 'decision-log',
    name: 'Decision Log',
    description: 'Template for documenting important decisions',
    category: 'Work',
    content: `# Decision Log

**Date:** ${new Date().toLocaleDateString()}
**Decision ID:** 
**Status:** [ ] Proposed [ ] Approved [ ] Implemented [ ] Superseded

## Context
What is the situation that requires a decision?

## Decision
What decision was made?

## Rationale
Why was this decision made?

## Alternatives Considered
- **Option 1:** Pros and cons
- **Option 2:** Pros and cons

## Stakeholders
- **Decision Maker:** 
- **Consulted:** 
- **Informed:** 

## Implementation
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Success Criteria
How will we know if this decision was successful?

## Review Date
When should this decision be reviewed?

## Notes
`,
    tags: ['decision', 'documentation', 'work'],
    icon: '⚖️'
  }
];

export class NoteTemplatesService {
  private customTemplates: NoteTemplate[] = [];
  private readonly STORAGE_KEY = 'devnotes-custom-templates';

  constructor() {
    this.loadCustomTemplates();
  }

  private loadCustomTemplates(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.customTemplates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load custom templates:', error);
      this.customTemplates = [];
    }
  }

  private saveCustomTemplates(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customTemplates));
    } catch (error) {
      console.error('Failed to save custom templates:', error);
    }
  }

  public getAllTemplates(): NoteTemplate[] {
    return [...DEFAULT_TEMPLATES, ...this.customTemplates];
  }

  public getTemplatesByCategory(category: string): NoteTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  public getTemplate(id: string): NoteTemplate | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }

  public getCategories(): string[] {
    const categories = new Set(this.getAllTemplates().map(template => template.category));
    return Array.from(categories).sort();
  }

  public createCustomTemplate(template: Omit<NoteTemplate, 'id'>): string {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: NoteTemplate = {
      ...template,
      id
    };

    this.customTemplates.push(newTemplate);
    this.saveCustomTemplates();
    
    return id;
  }

  public updateCustomTemplate(id: string, updates: Partial<NoteTemplate>): boolean {
    const index = this.customTemplates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.customTemplates[index] = { ...this.customTemplates[index], ...updates };
    this.saveCustomTemplates();
    
    return true;
  }

  public deleteCustomTemplate(id: string): boolean {
    const index = this.customTemplates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.customTemplates.splice(index, 1);
    this.saveCustomTemplates();
    
    return true;
  }

  public isCustomTemplate(id: string): boolean {
    return this.customTemplates.some(template => template.id === id);
  }

  public searchTemplates(query: string): NoteTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery) ||
      template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  public getRecentlyUsedTemplates(limit: number = 5): NoteTemplate[] {
    try {
      const recentIds = JSON.parse(localStorage.getItem('devnotes-recent-templates') || '[]');
      return recentIds
        .map((id: string) => this.getTemplate(id))
        .filter(Boolean)
        .slice(0, limit);
    } catch (error) {
      return [];
    }
  }

  public markTemplateUsed(templateId: string): void {
    try {
      const recentIds = JSON.parse(localStorage.getItem('devnotes-recent-templates') || '[]');
      const filteredIds = recentIds.filter((id: string) => id !== templateId);
      const updatedIds = [templateId, ...filteredIds].slice(0, 10); // Keep last 10
      localStorage.setItem('devnotes-recent-templates', JSON.stringify(updatedIds));
    } catch (error) {
      console.error('Failed to update recent templates:', error);
    }
  }
}

// Singleton instance
export const noteTemplatesService = new NoteTemplatesService();