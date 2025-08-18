import { GuideSection, SearchIndex } from '../../types/userGuide';

// Stop words to exclude from indexing
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
]);

export const createSearchIndex = (sections: GuideSection[]): SearchIndex => {
  const terms = new Map<string, string[]>();
  const sectionMap = new Map<string, {
    title: string;
    content: string;
    keywords: string[];
  }>();

  sections.forEach(section => {
    // Store section data
    sectionMap.set(section.id, {
      title: section.title,
      content: section.content,
      keywords: section.searchKeywords,
    });

    // Index title words (higher weight)
    const titleWords = extractWords(section.title);
    titleWords.forEach(word => {
      addToIndex(terms, word, section.id, 3); // Title words get weight 3
    });

    // Index content words
    const contentWords = extractWords(section.content);
    contentWords.forEach(word => {
      addToIndex(terms, word, section.id, 1); // Content words get weight 1
    });

    // Index keywords (highest weight)
    section.searchKeywords.forEach(keyword => {
      const keywordWords = extractWords(keyword);
      keywordWords.forEach(word => {
        addToIndex(terms, word, section.id, 5); // Keywords get weight 5
      });
    });

    // Index headers from markdown content
    const headers = extractHeaders(section.content);
    headers.forEach(header => {
      const headerWords = extractWords(header);
      headerWords.forEach(word => {
        addToIndex(terms, word, section.id, 2); // Headers get weight 2
      });
    });
  });

  return { terms, sections: sectionMap };
};

const extractWords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace non-word characters with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .map(word => word.trim())
    .filter(word => word.length > 0);
};

const extractHeaders = (content: string): string[] => {
  const headerRegex = /^#{1,6}\s+(.+)$/gm;
  const headers: string[] = [];
  let match;
  
  while ((match = headerRegex.exec(content)) !== null) {
    headers.push(match[1].trim());
  }
  
  return headers;
};

const addToIndex = (terms: Map<string, string[]>, word: string, sectionId: string, weight: number) => {
  const existing = terms.get(word) || [];
  
  // Add section ID multiple times based on weight for scoring
  for (let i = 0; i < weight; i++) {
    existing.push(sectionId);
  }
  
  terms.set(word, existing);
};

export const searchSections = (
  searchIndex: SearchIndex,
  query: string,
  allSections: GuideSection[]
): GuideSection[] => {
  if (!query.trim()) return [];

  const queryWords = extractWords(query);
  const sectionScores = new Map<string, number>();

  queryWords.forEach(word => {
    // Exact matches
    const exactMatches = searchIndex.terms.get(word) || [];
    exactMatches.forEach(sectionId => {
      sectionScores.set(sectionId, (sectionScores.get(sectionId) || 0) + 1);
    });

    // Partial matches (prefix matching)
    searchIndex.terms.forEach((sectionIds, term) => {
      if (term.startsWith(word) && term !== word) {
        sectionIds.forEach(sectionId => {
          sectionScores.set(sectionId, (sectionScores.get(sectionId) || 0) + 0.5);
        });
      }
    });

    // Fuzzy matches (contains)
    searchIndex.terms.forEach((sectionIds, term) => {
      if (term.includes(word) && term !== word && !term.startsWith(word)) {
        sectionIds.forEach(sectionId => {
          sectionScores.set(sectionId, (sectionScores.get(sectionId) || 0) + 0.2);
        });
      }
    });
  });

  // Boost scores for sections that match multiple query words
  const multiWordBonus = queryWords.length > 1 ? 2 : 1;
  sectionScores.forEach((score, sectionId) => {
    const matchedWords = queryWords.filter(word => {
      const matches = searchIndex.terms.get(word) || [];
      return matches.includes(sectionId);
    });
    
    if (matchedWords.length > 1) {
      sectionScores.set(sectionId, score * multiWordBonus);
    }
  });

  // Sort by score and return matching sections
  const sortedSectionIds = Array.from(sectionScores.entries())
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([sectionId]) => sectionId);

  // Deduplicate section IDs
  const uniqueSectionIds = [...new Set(sortedSectionIds)];

  return uniqueSectionIds
    .map(id => allSections.find(section => section.id === id))
    .filter((section): section is GuideSection => section !== undefined)
    .slice(0, 10); // Limit to top 10 results
};