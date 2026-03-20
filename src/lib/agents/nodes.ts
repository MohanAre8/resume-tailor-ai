import { GraphStateType } from "./state";
import { HumanMessage } from "@langchain/core/messages";
import { researchModel, tailorModel, criticModel } from "@/lib/llm/groq-models";
import {
  extractJDKeywords,
} from "@/lib/resume/analyzer";
import { researchCompanyRole } from "./research";

// Utility to stay under rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────
// FORMAT RESUME TO HTML (Times New Roman, Professional Styling)
// ─────────────────────────────────────────────────────────────
const formatResumeToHTML = (resume: string): string => {
  const lines = resume.split('\n');
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      margin: 40px;
      line-height: 1.4;
      font-size: 11pt;
      color: #000;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
      border-bottom: 1px solid #000;
      padding-bottom: 3pt;
    }
    h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 8pt;
      margin-bottom: 2pt;
    }
    .job-header {
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 4pt;
    }
    .job-meta {
      font-size: 10pt;
      margin-bottom: 6pt;
    }
    ul {
      margin: 4pt 0;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 6pt;
      text-align: justify;
    }
    .section {
      margin-bottom: 12pt;
    }
  </style>
</head>
<body>
`;

  let inBulletSection = false;
  let bulletItems: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      // Empty line
      if (bulletItems.length > 0) {
        html += '<ul>' + bulletItems.map(b => `<li>${b}</li>`).join('') + '</ul>';
        bulletItems = [];
        inBulletSection = false;
      }
      return;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      // Bullet point
      inBulletSection = true;
      const bulletText = trimmed.replace(/^[•–-]\s*/, '').trim();
      bulletItems.push(bulletText);
    } else if (inBulletSection && line.match(/^\s{2,}/)) {
      // Continuation of previous bullet (indented)
      if (bulletItems.length > 0) {
        bulletItems[bulletItems.length - 1] += ' ' + trimmed;
      }
    } else {
      // Header or label
      if (bulletItems.length > 0) {
        html += '<ul>' + bulletItems.map(b => `<li>${b}</li>`).join('') + '</ul>';
        bulletItems = [];
        inBulletSection = false;
      }

      if (trimmed.match(/^[A-Z\s]+$/) && trimmed.length > 3) {
        // Section header (all caps)
        html += `<h2>${trimmed}</h2>`;
      } else if (trimmed.match(/^[A-Z].*[–|,].*(20\d{2}|Present)/)) {
        // Job header (Company/Role | Location | Date)
        html += `<div class="job-header">${trimmed}</div>`;
      } else {
        // Regular text or sub-header
        html += `<div class="job-meta">${trimmed}</div>`;
      }
    }
  });

  if (bulletItems.length > 0) {
    html += '<ul>' + bulletItems.map(b => `<li>${b}</li>`).join('') + '</ul>';
  }

  html += `
</body>
</html>
`;

  return html;
};

// ─────────────────────────────────────────────────────────────
// RESUME FORMATTER (Submission-Ready Format)
// ─────────────────────────────────────────────────────────────
const formatResumeForSubmission = (resume: string): string => {
  let formatted = resume;

  // Remove markdown bold (**text**) and replace with plain format
  // Keep the text but remove the ** markers
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Normalize bullet points (convert - or • to consistent format)
  formatted = formatted.replace(/^[\s]*([-–•])\s+/gm, '• ');

  // Fix indentation: remove excessive blank lines between bullets
  formatted = formatted.replace(/\n\n+(?=\s*•)/g, '\n');

  // Trim excessive whitespace within bullets (2-3 lines max)
  const lines = formatted.split('\n');
  let processed: string[] = [];
  let currentBullet = '';

  lines.forEach((line) => {
    if (line.trim().startsWith('•')) {
      if (currentBullet) {
        processed.push(currentBullet.trim());
      }
      currentBullet = line;
    } else if (line.trim() && currentBullet) {
      // Continuation of bullet (2-3 line max)
      if ((currentBullet.split('\n').length) < 3) {
        currentBullet += '\n' + line;
      }
    } else if (line.trim()) {
      // Section headers, company names, etc.
      if (currentBullet) {
        processed.push(currentBullet.trim());
        currentBullet = '';
      }
      processed.push(line);
    } else if (currentBullet && line.trim() === '') {
      // Blank line after bullet
      processed.push(currentBullet.trim());
      currentBullet = '';
    }
  });

  if (currentBullet) {
    processed.push(currentBullet.trim());
  }

  formatted = processed.join('\n');

  // Normalize spacing: single space after periods, no double spaces
  formatted = formatted.replace(/\s{2,}/g, ' ');

  // Ensure section headers are on their own line
  formatted = formatted.replace(/([A-Z][A-Za-z\s]+)\s+(•|[-–])/g, '$1\n$2');

  // Remove trailing whitespace per line
  formatted = formatted
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');

  // Remove excessive blank lines between sections (max 1 blank line)
  formatted = formatted.replace(/\n\n\n+/g, '\n\n');

  // Trim start and end
  formatted = formatted.trim();

  return formatted;
};

// ─────────────────────────────────────────────────────────────
// AGENT 1: RESEARCHER (Web Search + Keyword Extraction)
// ─────────────────────────────────────────────────────────────
export const researcherAgent = async (state: GraphStateType) => {
  console.log("--- [Agent 1] Researcher (Web Search) ---");
  await sleep(1000);
  const { companyName, jobDescription, roleTitle } = state;

  try {
    // Web search for company projects and real tech stack
    const { insights, keywords } = await researchCompanyRole(
      companyName,
      roleTitle || "Engineer",
      jobDescription
    );

    console.log(`[Agent 1] Found ${keywords.length} keywords from web research`);
    console.log(`[Agent 1] Keywords: ${keywords.slice(0, 10).join(", ")}...`);

    const researchInsights = JSON.stringify({
      keywords,
      companyInsights: insights.substring(0, 2000),
      sourceType: "web_search"
    });

    return {
      researchInsights,
      companyInsights: insights
    };
  } catch (error) {
    console.error("[Researcher] Web search failed:", error);
    return {
      researchInsights: JSON.stringify({
        keywords: [],
        sourceType: "fallback"
      }),
      companyInsights: ""
    };
  }
};

// ─────────────────────────────────────────────────────────────
// AGENT 2B: CONCISENESS AGENT (Compress to 1-2 Pages - KEEP ALL SECTIONS)
// ─────────────────────────────────────────────────────────────
export const concisennessAgent = async (state: GraphStateType) => {
  console.log("--- [Agent 2B] Conciseness (Optimize Length) ---");
  await sleep(1500);
  const { currentTailoredResume, jobDescription } = state;

  try {
    const wordCount = currentTailoredResume.split(/\s+/).length;
    console.log(`[Conciseness] Current length: ${wordCount} words`);

    // If already under target, skip
    if (wordCount <= 550) {
      console.log("[Conciseness] Resume already concise. Skipping.");
      return {
        currentTailoredResume, // Return unchanged
      };
    }

    const prompt = `You are an expert resume editor specializing in MAXIMUM IMPACT with MINIMUM words.

CRITICAL REQUIREMENT: KEEP ALL SECTIONS AND HEADERS FROM THIS RESUME.

CURRENT RESUME (${wordCount} words - TOO LONG):
${currentTailoredResume}

JOB REQUIREMENTS:
${jobDescription.substring(0, 500)}

TARGET: Compress to 450-650 words (fits 1-2 pages) while KEEPING EVERY SECTION.

COMPRESSION RULES (STRICT):
1. KEEP ALL SECTION HEADERS (SKILLS, EDUCATION, EXPERIENCE, PROJECTS, etc.)
2. For each section: KEEP the 3-5 STRONGEST bullets (highest metrics + relevance to JD)
3. REMOVE: Weakest bullets in each section, duplicate keywords, redundant details
4. COMPRESS: Multi-line bullets into 1-2 lines WITHOUT losing metrics
5. COMBINE: Similar achievements into single bullet when possible
6. CUT ruthlessly within sections: Remove "nice to have" items, keep only "must impress" 
7. PRIORITY within sections: Metrics > Technical depth > Process improvements
8. DO NOT REMOVE ANY SECTION HEADERS
9. Ensure every section has at least 1-2 bullets (never empty sections)
10. Return COMPLETE resume ONLY (no notes, no commentary)

STRUCTURE PRESERVATION EXAMPLE:
BEFORE:
EXPERIENCE
• Company A role – many bullets
EDUCATION
• Degree details
SKILLS
• Long skill list

AFTER (compressed):
EXPERIENCE
• Company A role – 3-4 strongest bullets (concise)
EDUCATION
• Degree details (kept intact)
SKILLS
• Top relevant skills (concise)

COMPRESSED RESUME (450-650 words, ALL SECTIONS INTACT):`;

    console.log("[Conciseness] Calling AI to compress resume (keeping all sections)...");
    const response = await tailorModel.invoke([new HumanMessage(prompt)]);
    let compressedResume = (response.content as string).trim();

    // Clean up preamble
    compressedResume = compressedResume.replace(/^[^A-Za-z0-9]{0,50}/, '');
    compressedResume = compressedResume.replace(/^(Here's|Here is|I've|I have|The compressed|The optimized|Below)[^:]*:?\s*/i, '');

    // Remove commentary
    const commentaryPatterns = [
      /\n(---+|===+)[\s\S]*$/,
      /\n+['"]?(?:Note|Notes|Changes|Improvements|Summary|Feedback)[:\s][\s\S]*$/i,
      /\n+This (?:resume|version)[\s\S]*$/i,
    ];

    for (const pattern of commentaryPatterns) {
      compressedResume = compressedResume.replace(pattern, '');
    }

    compressedResume = compressedResume.trim();

    const newWordCount = compressedResume.split(/\s+/).length;
    const reductionPercent = Math.round(((wordCount - newWordCount) / wordCount) * 100);

    console.log(`[Conciseness] Compressed: ${wordCount} → ${newWordCount} words (${reductionPercent}% reduction)`);

    // Verify compression was effective
    if (newWordCount > 750) {
      console.warn(`[Conciseness] ⚠️ Still long (${newWordCount} words). May need another pass.`);
    }

    // Count sections preserved
    const originalSections = (currentTailoredResume.match(/^[A-Z\s]+$/gm) || []).length;
    const compressedSections = (compressedResume.match(/^[A-Z\s]+$/gm) || []).length;
    console.log(`[Conciseness] Sections: ${originalSections} preserved (compressed: ${compressedSections})`);

    // Count bullets to ensure we kept good coverage
    const bulletCount = (compressedResume.match(/^[\s]*[•–-]/gm) || []).length;
    console.log(`[Conciseness] Bullet points: ${bulletCount}`);

    return {
      currentTailoredResume: compressedResume,
    };
  } catch (error) {
    console.error("[Conciseness] Failed:", error);
    return {
      currentTailoredResume, // Return original if compression fails
    };
  }
};

export const tailorAgent = async (state: GraphStateType) => {
  console.log(`--- [Agent 2] Tailor (Iteration ${(state.tailorIterations || 0) + 1}/2) ---`);
  await sleep(2000);
  const { baseResume, currentTailoredResume, jobDescription, researchInsights, criticFeedback } = state;

  const resumeToTailor = currentTailoredResume || baseResume;

  try {
    // Extract JD keywords to identify gaps
    const jdKeywords = extractJDKeywords(jobDescription);
    console.log(`[Tailor] Found ${jdKeywords.length} key terms in JD: ${jdKeywords.slice(0, 10).join(', ')}`);

    // Split resume into sections by headers (Works for formatted resumes)
    const sections = resumeToTailor.split(/\n(?=[A-Z\s&]{3,}(?:\n|$)|[A-Z]+(?:\||–|-|\s*$))/);
    console.log(`[Tailor] Found ${Math.max(1, sections.length)} resume sections`);

    // Build improvement prompt - CONCISE to leave tokens for full resume output
    let prompt = `You are a top ATS recruiter expert optimizing resumes for executive/senior technical roles.

BULLET FORMAT (This is CRITICAL):
Each bullet MUST follow: [STRONG ACTION VERB] [WHAT + HOW (with specific tools/tech)] [BUSINESS IMPACT/METRIC]

Action Verbs (use these): Architected, Built, Designed, Implemented, Engineered, Established, Advised, Optimized, Accelerated, Scaled, Automated, Orchestrated, Deployed

REQUIRED STRUCTURE:
• [Action Verb] [concrete what you built/did] using [specific tech stack, tools, frameworks] to [purpose/problem solved] achieving [quantified impact: %, $, time, or business metric].
  - Each bullet should be 2-3 lines (not 1-2)
  - Include specific technologies (frameworks, APIs, DBs, services)
  - Include business impact or measurable outcome
  - Show methodology/approach when relevant

REFERENCE EXAMPLE (for your industry):
• Architected multi-agent RAG pipeline using LangGraph + OpenAI GPT-4o with Pinecone vector DB for embedding-based document retrieval designing the full prompt workflow, context chunking strategy, and MCP-style tool-calling interfaces that automated ERP invoice reconciliation and cut manual review by 55%+ for the Payments team.

TARGET JOB KEYWORDS (weave in naturally): ${jdKeywords.slice(0, 15).join(', ')}

JOB REQUIREMENTS & CONTEXT:
${jobDescription.substring(0, 700)}

CURRENT RESUME:
${resumeToTailor}

YOUR TASK:
1. Rewrite EVERY bullet to follow the [Action Verb] [What/How] [Impact] structure
2. Make bullets 2-3 lines long (detailed, not brief)
3. Include SPECIFIC tech: frameworks, languages, APIs, databases, tools (not generic terms)
4. Quantify impact: %, $, time saved, user volume, accuracy rate, performance gain
5. For each role/section, show what you BUILT and the business value it created
6. Keep all sections/structure intact
7. Return COMPLETE resume ONLY (no notes, no commentary, no markdown formatting)
${criticFeedback ? `\n8. CRITICAL FIX: ${criticFeedback}` : ''}

OPTIMIZED RESUME:`;

    console.log("[Tailor] Calling AI to improve resume...");
    const response = await tailorModel.invoke([new HumanMessage(prompt)]);
    let improvedResume = (response.content as string).trim();

    // Clean up - remove any preamble the AI might add
    improvedResume = improvedResume.replace(/^[^A-Za-z0-9]{0,50}/, ''); // Remove leading garbage
    improvedResume = improvedResume.replace(/^(Here's|Here is|I've|I have|The improved|The updated|Below)[^:]*:?\s*/i, ''); // Remove intro

    // Remove trailing commentary/notes
    const commentaryPatterns = [
      /\n(---+|===+)[\s\S]*$/,  // Anything after dividers
      /\n+['"]?(?:Note|Notes|Changes|Improvements|Summary|Feedback|Updates|Modified)[:\s][\s\S]*$/i,
      /\n+I've (?:added|improved|changed)[\s\S]*$/i,
      /\n+The (?:improvements|changes|updates)[\s\S]*$/i,
      /\n+This (?:resume|version)[\s\S]*$/i,
    ];
    
    for (const pattern of commentaryPatterns) {
      improvedResume = improvedResume.replace(pattern, '');
    }

    // Format for submission (fixes indentation, bold formatting, spacing)
    improvedResume = formatResumeForSubmission(improvedResume);

    // Trim excess whitespace
    improvedResume = improvedResume
      .split('\n')
      .filter(line => line.trim().length > 0 || /^\s*$/.test(line)) // Keep empty lines
      .join('\n')
      .trim();

    // Verify we didn't lose too much content (should be similar or slightly longer)
    const originalWords = resumeToTailor.split(/\s+/).length;
    const improvedWords = improvedResume.split(/\s+/).length;
    
    if (improvedWords < originalWords * 0.7) {
      console.warn(`[Tailor] Output seems truncated (${improvedWords} words vs ${originalWords} original)`);
      console.warn(`[Tailor] First 200 chars: ${improvedResume.substring(0, 200)}`);
      // Still return it - might just be more concise
    }

    // VALIDATION: Check if bullets follow [Action Verb] [What/How] [Impact] format
    const actionVerbs = ['Architected', 'Built', 'Designed', 'Implemented', 'Engineered', 'Established', 'Advised', 'Optimized', 'Accelerated', 'Scaled', 'Automated', 'Orchestrated', 'Deployed', 'Developed', 'Created', 'Integrated', 'Managed', 'Led', 'Improved', 'Enhanced', 'Reduced', 'Increased'];
    const bulletLines = improvedResume.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
    
    let validBullets = 0;
    let metricsFound = 0;
    let techTermsFound = 0;
    
    bulletLines.forEach(bullet => {
      const text = bullet.toLowerCase();
      // Check for action verb at start
      const startsWithVerb = actionVerbs.some(verb => bullet.trim().match(new RegExp(`^[-•]\\s*${verb}`, 'i')));
      if (startsWithVerb) validBullets++;
      
      // Check for metrics/impact
      if (/\d+%|dollar|\$|times? faster|reduced|improved|increased|achieved|delivered/i.test(text)) {
        metricsFound++;
      }
      
      // Check for tech terms (common tech stack)
      if (/(react|typescript|python|java|aws|gcp|azure|kubernetes|docker|api|database|sql|nosql|langchain|llm|ai|ml|framework|tool)/i.test(text)) {
        techTermsFound++;
      }
    });
    
    const qualityScore = {
      validBulletFormat: validBullets,
      totalBullets: bulletLines.length,
      metricsCount: metricsFound,
      techTermsCount: techTermsFound
    };
    
    console.log(`[Tailor] Quality Check: ${validBullets}/${bulletLines.length} bullets follow [Verb + What + Impact] format`);
    console.log(`[Tailor] Metrics found: ${metricsFound}/${bulletLines.length}, Tech terms: ${techTermsFound}/${bulletLines.length}`);
    
    if (validBullets < bulletLines.length * 0.7) {
      console.warn(`[Tailor] ⚠️ Many bullets may not follow proper format. Expected [Action Verb] [What/How] [Impact]`);
    }

    console.log(`[Tailor] Output: ${improvedResume.length} chars (input was ${resumeToTailor.length} chars)`);

    return {
      currentTailoredResume: improvedResume,
      resumeHTML: formatResumeToHTML(improvedResume), // HTML formatted version for display
      tailorIterations: 1,
      improvedSections: "Resume tailored for job requirements",
    };

  } catch (error) {
    console.error("[Tailor] Failed:", error);
    return {
      currentTailoredResume: resumeToTailor,
      resumeHTML: formatResumeToHTML(resumeToTailor), // Format original if AI fails
      tailorIterations: 1,
      improvedSections: "Error - using original",
    };
  }
};

// ─────────────────────────────────────────────────────────────
// PRE-TAILOR SCORER (Score Original Resume)
// ─────────────────────────────────────────────────────────────
export const scoreResumeAgent = async (state: GraphStateType) => {
  console.log("--- [Scorer] Scoring Original Resume ---");
  await sleep(500);
  const { baseResume, jobDescription } = state;

  try {
    const prompt = `Score this resume's ATS match with the job description (0-100).

Job requirements:
${jobDescription.substring(0, 600)}

Resume:
${baseResume.substring(0, 1500)}

Scoring criteria:
- Keyword match (40%)
- Structure & formatting (30%)
- Metrics/quantifiable results (20%)
- Readability (10%)

Output ONLY JSON:
{"score": <number 0-100>, "reasoning": "brief explanation"}`;

    const response = await criticModel.invoke([new HumanMessage(prompt)]);
    const content = response.content as string;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const score = Math.min(100, Math.max(0, parsed.score || 60));
      console.log(`[Scorer] Original resume score: ${score}`);
      return {
        originalScore: score,
        scoreHistory: [`Original: ${score}%`],
      };
    }

    console.log("[Scorer] Fallback score: 65");
    return {
      originalScore: 65,
      scoreHistory: ["Original: 65%"],
    };
  } catch (error) {
    console.error("[Scorer] Failed:", error);
    return {
      originalScore: 60,
      scoreHistory: ["Original: 60%"],
    };
  }
};

// ─────────────────────────────────────────────────────────────
// AGENT 3: ATS CRITIC (Score Tailored Resume + Feedback)
// ─────────────────────────────────────────────────────────────
export const criticAgent = async (state: GraphStateType) => {
  console.log("--- [Agent 3] ATS Critic ---");
  await sleep(1000);
  const { currentTailoredResume, jobDescription, tailorIterations, improvedSections } = state;

  try {
    const prompt = `You are an ATS scoring expert evaluating resume quality for recruiter scanning efficiency.

JOB REQUIREMENTS:
${jobDescription.substring(0, 500)}

RESUME TO SCORE:
${currentTailoredResume.substring(0, 1500)}

SCORING RUBRIC (100 points total):
1. BULLET FORMAT COMPLIANCE (30%): Do bullets follow pattern [Action Verb] [What/How with specific tech] [Business Impact/Metric]?
   - Proper format: "Architected [solution] using [tech stack] achieving [metric/impact]"
   - Examples of strong verbs: Architected, Built, Designed, Implemented, Engineered, Automated, Scaled
   - Deductions: Weak action verbs, missing tech specifics, no quantified impact

2. SPECIFICITY & DEPTH (25%): Are bullets detailed with concrete tech, tools, frameworks, APIs?
   - Strong: "Built event-driven backend using AWS SQS + Lambda for document processing"
   - Weak: "Improved system performance"
   - Check: Specific technologies, frameworks, tools mentioned?

3. QUANTIFIED IMPACT (25%): Does every bullet show measurable business value?
   - Strong metrics: %, $ saved, time reduction, accuracy rate, scale (e.g., "55% reduction", "99% accuracy", "$2M project")
   - Weak: "improved", "enhanced", "better performance" without numbers

4. KEYWORD ALIGNMENT (15%): Do bullets include JD keywords naturally?
   - Missing keywords = deduction
   - Forced/awkward keywords = minor penalty

5. RECRUITER SCANNABILITY (5%): Can a recruiter grasp impact in 6-second scan?
   - 2-3 line bullets: better
   - Each bullet has clear value proposition

SCORING NOTES:
- A+ (95-100): All bullets follow format, specific tech, strong metrics, clean scannable
- A (90-94): 90%+ bullets proper format, most have tech + metrics
- B+ (85-89): 70-80% proper format, most have some metrics
- C (70-84): ~50% proper format, inconsistent metrics
- F (<70): Most bullets don't follow format, weak metrics, generic language

Output JSON ONLY:
{"score": <0-100>, "feedback": "ONE specific fix for biggest improvement (max 1 sentence. Example: Add specific tech stack (React, FastAPI, AWS) and quantify the business impact for each bullet"}`;

    const response = await criticModel.invoke([new HumanMessage(prompt)]);
    const content = response.content as string;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const score = Math.min(100, Math.max(0, parsed.score || 85));
      const feedback = parsed.feedback || "Continue refining";
      const iteration = (tailorIterations || 0) + 1;
      const improvedMsg = improvedSections ? ` (${improvedSections})` : "";
      const detailedFeedback = `${feedback}${improvedMsg}`;
      console.log(`[Agent 3] Score after iteration ${iteration}: ${score}`);
      return {
        currentScore: score,
        criticFeedback: detailedFeedback,
        scoreHistory: [`Iteration ${iteration}: ${score}%`],
      };
    }

    console.log("[Agent 3] Fallback score: 88");
    return {
      currentScore: 88,
      criticFeedback: "Score evaluated.",
      scoreHistory: [""],
    };
  } catch (error) {
    console.error("[Critic] Failed:", error);
    return {
      currentScore: 87,
      criticFeedback: "Fallback scoring applied.",
      scoreHistory: [""],
    };
  }
};

// ─────────────────────────────────────────────────────────────
// ROUTER (Loop Logic)
// ─────────────────────────────────────────────────────────────
export const evaluateLoop = (state: GraphStateType) => {
  const { currentScore, tailorIterations, originalScore, scoreHistory } = state;
  const iter = (tailorIterations || 0);

  // Build progress string
  let progressStr = `Original: ${originalScore}%`;
  for (let i = 0; i < iter; i++) {
    progressStr += ` → Iteration ${i + 1}: ${currentScore}%`;
  }

  console.log(`\n--- Score Progression: ${progressStr} ---`);

  // If score >= 90, we're done
  if (currentScore >= 90) {
    console.log(`✅ Score ${currentScore} >= 90. Finalizing...\n`);
    return "end";
  }

  // If we've done 2 iterations, stop (user specified max 2)
  if (iter >= 2) {
    console.log(`ℹ️ Reached max iterations (2). Current score: ${currentScore}. Finalizing...\n`);
    return "end";
  }

  // Otherwise, loop back to tailor for refinement
  console.log(`🔄 Score ${currentScore} < 90. Refining resume (iteration ${iter + 1}/2)...\n`);
  return "tailor";
};
