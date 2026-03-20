import { ChatGroq } from "@langchain/groq";

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn("⚠️ GROQ_API_KEY not set in environment");
}

/**
 * RESEARCH MODEL
 * Task: Extract keywords and insights from job description
 * Model: Llama 3.1 8B (fast, good for initial research)
 * Why: Lightweight task, needs speed not reasoning power
 */
export const researchModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: groqApiKey || "dummy_key_for_build",
  maxTokens: 1000,        // Keywords don't need much output
  temperature: 0.1,       // Low temp for consistent results
});

/**
 * TAILOR MODEL
 * Task: Rewrite resume sections with keywords
 * Model: Llama 3.1 8B (balanced, good for writing)
 * Why: Good quality writing + reasonable speed + lower cost
 */
export const tailorModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: groqApiKey || "dummy_key_for_build",
  maxTokens: 3500,        // Full resume can be 1500+ tokens, need room for output
  temperature: 0.1,       // Low temp for consistency
});

/**
 * CRITIC MODEL
 * Task: Score resume and provide feedback
 * Model: Llama 3.3 70B (most capable)
 * Why: Complex scoring needs better reasoning capability
 */
export const criticModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: groqApiKey || "dummy_key_for_build",
  maxTokens: 500,         // Just score + feedback needed
  temperature: 0.1,       // Low temp for deterministic scoring
});

/**
 * FALLBACK MODEL
 * Used if primary model fails
 */
export const fallbackModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: groqApiKey || "dummy_key_for_build",
  maxTokens: 1000,
  temperature: 0.2,
});
