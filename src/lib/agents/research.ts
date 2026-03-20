import { tavily } from "@tavily/core";

// Initialize Tavily API client with API key
const client = tavily({
  apiKey: process.env.TAVILY_API_KEY || "demo",
});

/**
 * Research company and role using web search
 * Finds real projects, tech stack, and company culture
 * Extracts hidden keywords that aren't explicitly in JD
 */
export async function researchCompanyRole(
  companyName: string,
  roleTitle: string,
  jobDescription: string
): Promise<{ insights: string; keywords: string[] }> {
  try {
    console.log(`[Research] Web searching for ${companyName} ${roleTitle}...`);

    // Search for company projects and tech stack
    const searchQuery = `${companyName} ${roleTitle} recent projects technology stack 2024 2025`;

    const response = await client.search(searchQuery, {
      includeAnswer: true,
      maxResults: 5,
      searchDepth: "basic",
    });

    // Extract insights from search results
    const insights = response.answer || "";
    console.log(`[Research] Found insights from ${response.results.length} sources`);

    // Extract keywords from both JD and web research
    const jdKeywords = extractKeywordsFromText(jobDescription);
    const webKeywords = extractKeywordsFromText(insights);

    // Combine and deduplicate keywords
    const allKeywords = Array.from(new Set([...jdKeywords, ...webKeywords]));

    return {
      insights,
      keywords: allKeywords,
    };
  } catch (error) {
    console.error("[Research] Web search failed:", error);

    // Fallback: extract only from JD
    const jdKeywords = extractKeywordsFromText(jobDescription);
    return {
      insights: `Job Description Analysis (web search failed):\n${jobDescription.substring(0, 1000)}`,
      keywords: jdKeywords,
    };
  }
}

/**
 * Extract tech keywords from text
 * Looks for common tech stack terms, frameworks, tools
 */
function extractKeywordsFromText(text: string): string[] {
  const keywords: string[] = [];
  const textLower = text.toLowerCase();

  const techTerms = [
    // Languages
    "python",
    "javascript",
    "typescript",
    "java",
    "golang",
    "go",
    "rust",
    "c++",
    "c#",
    "php",
    "ruby",
    "kotlin",
    "swift",

    // Frontend
    "react",
    "vue",
    "angular",
    "svelte",
    "nextjs",
    "next.js",
    "gatsby",
    "remix",
    "html",
    "css",
    "tailwind",

    // Backend
    "nodejs",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "spring",
    "dotnet",
    ".net",
    "rails",
    "laravel",

    // Databases
    "mongodb",
    "postgresql",
    "postgres",
    "mysql",
    "redis",
    "firebase",
    "dynamodb",
    "cassandra",
    "elasticsearch",

    // Cloud & DevOps
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "kubernetes",
    "k8s",
    "docker",
    "terraform",
    "jenkins",
    "ci/cd",
    "cicd",
    "github",
    "gitlab",
    "github actions",

    // Concepts
    "microservices",
    "rest api",
    "graphql",
    "machine learning",
    "ml",
    "ai",
    "deep learning",
    "nlp",
    "computer vision",
    "data pipeline",
    "etl",
    "real-time",
    "streaming",
    "analytics",
    "prediction",
    "optimization",

    // Tools
    "git",
    "jira",
    "agile",
    "scrum",
    "tdd",
    "testing",
    "pytest",
    "jest",
    "mocha",
    "jasmine",
    "vitest",
    "selenium",
    "postman",

    // Architecture Patterns
    "design patterns",
    "solid",
    "clean code",
    "scalable",
    "high performance",
    "low latency",
  ];

  for (const term of techTerms) {
    if (textLower.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
}
