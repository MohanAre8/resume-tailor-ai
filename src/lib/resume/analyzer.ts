/**
 * Resume structure parser - NO AI USED
 * Splits resume into sections and identifies which need improvement
 */

export interface ResumeSection {
  name: string;
  content: string;
  startLine: number;
  endLine: number;
}

/**
 * Parse resume into sections (Contact, Experience, Skills, Education, etc.)
 * Uses structural analysis: looks for headers followed by content
 * NO tokens consumed
 *
 * @param resumeText Full resume text
 * @returns Array of sections found
 */
export const parseResumeStructure = (resumeText: string): ResumeSection[] => {
  const lines = resumeText.split('\n');
  const sections: ResumeSection[] = [];

  // Keywords that indicate section headers
  const sectionKeywords = [
    'contact', 'phone', 'email', 'linkedin', 'portfolio',
    'summary', 'objective', 'professional summary', 'profile', 'about', 'intro',
    'experience', 'work experience', 'employment', 'professional', 'job history', 'work history', 'career',
    'skills', 'technical skills', 'core competencies', 'expertise', 'technical', 'competencies',
    'education', 'academic', 'degree', 'certification', 'certifications', 'licenses', 'awards', 'training',
    'projects', 'portfolio', 'side projects', 'capstone',
    'achievements', 'accomplishments', 'highlights',
    'publications', 'articles', 'writing', 'speaking',
    'languages',
    'volunteer', 'volunteering', 'community', 'open source'
  ];

  let currentSection: { name: string; start: number; end: number } | null = null;
  const sectionBoundaries: { name: string; start: number; end: number }[] = [];

  // PASS 1: Identify section header lines using structural + keyword analysis
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim().toLowerCase();
    const isShortLine = line.trim().length < 80;
    const isUppercaseRich = (line.match(/[A-Z]/g) || []).length / Math.max(line.length, 1) > 0.3;

    // Check if this looks like a section header
    let isHeader = false;

    // Strategy 1: Line contains section keyword AND is short AND looks like header
    if (isShortLine && (isUppercaseRich || trimmed.length < 50)) {
      for (const keyword of sectionKeywords) {
        if (trimmed === keyword || 
            trimmed.startsWith(keyword + ' ') || 
            trimmed.includes(keyword + ':') ||
            trimmed.includes(keyword + '|')) {
          isHeader = true;
          break;
        }
      }
    }

    // Strategy 2: Structural detection - line is short, uppercase-heavy, isolated between content
    if (!isHeader && isShortLine && isUppercaseRich && trimmed.length > 3) {
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
      
      // If surrounded by content or followed by content, likely a header
      if ((prevLine.length > 20 || i < 3) && nextLine.length > 0) {
        isHeader = true;
      }
    }

    if (isHeader) {
      if (currentSection) {
        sectionBoundaries.push({
          name: currentSection.name,
          start: currentSection.start,
          end: i - 1
        });
      }
      currentSection = { name: trimmed, start: i + 1, end: 0 };
    }
  }

  // Add last section
  if (currentSection && (lines.length - currentSection.start) > 5) {
    sectionBoundaries.push({
      name: currentSection.name,
      start: currentSection.start,
      end: lines.length - 1
    });
  }

  // PASS 2: Extract section content
  if (sectionBoundaries.length > 0) {
    for (const boundary of sectionBoundaries) {
      const content = lines.slice(boundary.start, boundary.end + 1).join('\n').trim();
      if (content.length > 10) {
        sections.push({
          name: boundary.name.replace(/[:|]/g, '').trim(),
          content,
          startLine: boundary.start,
          endLine: boundary.end,
        });
      }
    }
  }

  // Fallback: if no sections detected, try double-newline splitting
  if (sections.length === 0) {
    const blocks = resumeText.split(/\n\s{2,}\n|\n\n\n/).filter(b => b.trim().length > 20);
    
    if (blocks.length > 2) {
      for (const block of blocks) {
        const firstLine = block.split('\n')[0].trim();
        if (firstLine.length < 80 && firstLine.length > 3) {
          sections.push({
            name: firstLine.toLowerCase(),
            content: block.trim(),
            startLine: 0,
            endLine: 0,
          });
        }
      }
    }
  }

  // Last resort: if still nothing, treat entire resume as content but log it
  if (sections.length === 0) {
    sections.push({
      name: 'content',
      content: resumeText.trim(),
      startLine: 0,
      endLine: lines.length,
    });
  }

  return sections;
};

/**
 * Extract keywords from job description
 * Simple string matching - NO tokens consumed
 *
 * @param jobDescription Full job description
 * @returns Array of keywords found in JD
 */
export const extractJDKeywords = (jobDescription: string): string[] => {
  // Curated list of common tech keywords
  const techKeywords = [
    // Languages
    'python', 'javascript', 'typescript', 'java', 'golang', 'rust',
    'c++', 'c#', 'php', 'ruby', 'swift',

    // Frontend
    'react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind',
    'nextjs', 'next.js', 'gatsby', 'remix',

    // Backend
    'nodejs', 'node.js', 'express', 'fastapi', 'django', 'flask',
    'spring', 'dotnet', '.net', 'rails',

    // Databases
    'mongodb', 'postgresql', 'postgres', 'mysql', 'redis', 'firebase',
    'elasticsearch', 'dynamodb', 'cassandra',

    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'kubernetes', 'docker',
    'terraform', 'jenkins', 'ci/cd', 'github', 'gitlab',

    // Tools & Concepts
    'git', 'microservices', 'api', 'rest', 'graphql',
    'agile', 'scrum', 'jira', 'oauth', 'jwt', 'sql',
    'machine learning', 'ai', 'pytorch', 'tensorflow',
    'testing', 'jest', 'mocha', 'rspec',
    'design patterns', 'solid', 'tdd'
  ];

  const jdLower = jobDescription.toLowerCase();
  const found: string[] = [];

  for (const keyword of techKeywords) {
    if (jdLower.includes(keyword) && !found.includes(keyword)) {
      found.push(keyword);
    }
  }

  return found;
};

/**
 * Identify sections that need improvement based on keyword match
 * Compares resume sections against JD keywords - NO tokens consumed
 *
 * @param sections Parsed resume sections
 * @param jdKeywords Keywords found in JD
 * @param jobDescription Original JD text
 * @returns Array of sections needing improvement
 */
export const identifyWeakSections = (
  sections: ResumeSection[],
  jdKeywords: string[],
  jobDescription: string
): ResumeSection[] => {
  const weakSections: ResumeSection[] = [];

  // Don't try to improve if no keywords to target
  if (jdKeywords.length === 0) return [];

  for (const section of sections) {
    const sectionLower = section.content.toLowerCase();

    // Count keyword matches
    const matches = jdKeywords.filter(k => sectionLower.includes(k)).length;
    const matchRatio = matches / jdKeywords.length;

    // Decide if this section should be improved
    let shouldImprove = false;

    // FOR "CONTENT" (entire resume as one): aggressive improvement
    if (section.name === 'content') {
      // If less than 40% keyword match, improve the whole thing
      shouldImprove = matchRatio < 0.4;
    } 
    // EXPERIENCE/WORK sections: should have 50%+ of keywords
    else if (section.name.includes('experience') || section.name.includes('work')) {
      shouldImprove = matchRatio < 0.5;
    }
    // SKILLS sections: should have 60%+ of keywords  
    else if (section.name.includes('skill') || section.name.includes('technical')) {
      shouldImprove = matchRatio < 0.6;
    }
    // SUMMARY/PROFILE: should mention key areas
    else if (section.name.includes('summary') || section.name.includes('profile')) {
      shouldImprove = matchRatio < 0.3;
    }
    // OTHER sections (education, projects): only improve if very weak
    else {
      shouldImprove = matchRatio < 0.2 || (matches === 0 && section.content.length < 200);
    }

    // Always improve large sections if they have few keywords
    if (matches < 2 && section.content.length > 300) {
      shouldImprove = true;
    }

    if (shouldImprove && section.content.trim().length > 0) {
      weakSections.push(section);
    }
  }

  // SAFETY: If no weak sections identified but we have keywords and multiple sections,
  // pick the largest section (usually experience) to improve
  if (weakSections.length === 0 && jdKeywords.length > 10 && sections.length > 1) {
    const largestNonContent = sections
      .filter(s => s.name !== 'content')
      .reduce((prev, curr) => curr.content.length > prev.content.length ? curr : prev, sections[0]);
    
    if (largestNonContent && largestNonContent.content.length > 100) {
      weakSections.push(largestNonContent);
    }
  }

  return weakSections;
};

/**
 * Merge resume sections back together
 * PRESERVES original formatting by replacing weak section content in-place
 * Uses line numbers from original parsing, NOT re-parsing the output
 *
 * @param strong Strong sections (keep unchanged)
 * @param weakImproved Improved weak sections from AI
 * @param allSections All original sections with line numbers
 * @returns Merged resume text
 */
export const mergeResumeSections = (
  strong: ResumeSection[],
  weakImproved: string,
  allSections: ResumeSection[]
): string => {
  // If no weak sections were identified, return original
  if (!allSections || allSections.length === 0) {
    return weakImproved;
  }

  // Parse improved sections from AI response
  // AI returns text with [SECTION_NAME] headers
  const improvedMap = new Map<string, string>();
  
  const sectionNames = ['experience', 'skills', 'summary', 'education', 'projects', 
                        'certifications', 'achievements', 'work experience', 'professional summary'];
  
  for (const name of sectionNames) {
    // Match [SECTION_NAME] ... content ... [NEXT_SECTION] or end of string
    const regex = new RegExp(`\\[${name.toUpperCase()}\\][\\s\\n]+(.*?)(?=\\[|$)`, 'ims');
    const match = weakImproved.match(regex);
    if (match && match[1]) {
      improvedMap.set(name, match[1].trim());
    }
  }

  // Build output by iterating sections in original order
  const output: string[] = [];

  for (const section of allSections) {
    const sectionNameLower = section.name.toLowerCase();
    const isStrong = strong.some(s => s.name === section.name);

    if (isStrong) {
      // Keep strong sections exactly as they are
      output.push(section.content);
    } else {
      // Check if AI improved this section
      let improved = improvedMap.get(sectionNameLower);
      
      if (!improved) {
        // Try fuzzy matching (e.g., "work experience" ↔ "experience")
        for (const [key, value] of improvedMap.entries()) {
          if (sectionNameLower.includes(key) || key.includes(sectionNameLower)) {
            improved = value;
            break;
          }
        }
      }

      if (improved && improved.trim().length > 0) {
        // Use improved version
        output.push(improved);
      } else {
        // No improvement found, keep original
        output.push(section.content);
      }
    }
  }

  // Join with proper spacing
  return output.map(s => s.trim()).filter(s => s.length > 0).join('\n\n');
};
