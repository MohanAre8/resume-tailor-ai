# Resume Tailor & Application Tracker Implementation Plan

This document outlines the architecture and implementation steps for building the Multi-Agent Resume Tailoring and Application Tracking application.

## User Review Required

> [!IMPORTANT]
> **Please review the finalized plan:**
>
> - **Deployment:** Firebase App Hosting
> - **Data Storage:** User's personal Google Drive & Google Sheets (Privacy-First)
> - **Tech Stack:** TypeScript, Next.js (App Router), TailwindCSS
> - **Agent Framework:** LangGraph.js
> - **LLM Provider:** Google Gemini API (Free tier)
>
> _Question for User:_ Look over the Agent flow below. Are you ready to proceed with scaffolding the application using these exact specifications?

## Proposed Architecture

- **Frontend & Backend (Fullstack):** Next.js (App Router) using **TypeScript**. This allows sharing of types between the UI and Backend API Agents.
- **Styling:** TailwindCSS
- **Authentication:** NextAuth.js configured with Google Provider.
  - Required Scopes: `email`, `profile`, `https://www.googleapis.com/auth/drive.file`, `https://www.googleapis.com/auth/drive.readonly`, `https://www.googleapis.com/auth/spreadsheets`
- **Multi-Agent Orchestration:** LangGraph.js
  - We will use state graphs to model the cyclical "redo until perfection" loop.
- **AI Provider:** Google Gemini API (Heterogeneous Model Allocation).
  - **Tailor (Agent 2):** `gemini-1.5-pro` (High reasoning, 50 RPD limit).
  - **Researcher/Critic (Agents 1 & 3):** `gemini-1.5-flash` (Efficiency, 1500 RPD limit).
- **Hosting:** Firebase App Hosting.

## Application Flow & Multi-Agent System

### 1. Login & Input

- User authenticates via Google.
- User inputs:
  - Job Description (JD)
- [x] Integrate Google Drive Picker for file selection
- [x] Implement multi-format resume parser (PDF, DOCX, Google Docs, TXT)
- [x] Refine Agent prompts for single-pass high ATS scoring
- [x] Add robust JSON parsing for Critic feedback
- [x] Implement "Safety Score" fallback to prevent false-negative zeros
- [x] Force single-pass tailoring to conserve free-tier tokens
- [x] Add rate-limit guards for free-tier AI API
- [x] Generate Technical Documentation (MD, HTML, Artifact)
- [/] Firebase Hosting Deployment
  - [x] Create `apphosting.yaml`
  - [x] Generate Deployment Guide
  - [ ] User executes manual deployment
- [ ] Final End-to-End local verification

### 2. Processing (The 3-Agent Loop)

- **Agent 1 (The Researcher):** Takes the Company and Role as context. Uses Gemini to research previous projects of that company and synthesize typical tech stack/patterns to identify implicit "hidden keywords" that recruiters seek.
- **Agent 2 (The Tailor):** Takes Base Resume, JD, and Researcher's insights. Thoughtfully rewrites weak sections to include both explicit JD keywords and implicit insider keywords, maintaining authenticity. Rewrites weak sections until score reaches the goal.
- **Agent 3 (The ATS Critic):** Takes the Tailored Resume and the JD. Scores the match out of 100.
- **The Loop (LangGraph State Machine):**
  - If score >= 93: Finalize and proceed.
  - If score < 93: Provide specific feedback (what's missing, unnatural phrasing) and route back to Agent 2 (The Tailor). Maximum of 3 iterations to prevent infinite looping.

  **CRITICAL OUTPUT RULES for the Loop Output:**
  - Output the ENTIRE resume start to finish — every section, every bullet, every line
  - MUST include all sections from given resume
  - Only rewrite the weak sections
  - No em dashes (—) — use commas instead
  - Return ONLY the complete improved resume in given file — no commentary

### 3. Completion

- Final resume is previewed in the UI.
- Application automatically uploads the tailored PDF (or Google Doc format) to the user's Google Drive.
- Application automatically appends a new application record (Company, Role, Date, Resume Link) to the specified tracking Google Sheet.

## Proposed Changes (Scaffolding Timeline)

### Step 1: Baseline Project & Auth

- Initialize `Next.js` with TypeScript and Tailwind (non-interactive).
- Configure `NextAuth.js` with the Google OAuth provider and necessary scopes.
- Setup basic UI shell (Header, Dashboard/Upload screen).

### Step 2: Google Integrations

- Create helper functions (`lib/google.ts`) for:
  - Fetching files from Drive.
  - Creating/Updating a Document/PDF in Drive.
  - Finding or creating a Google Sheet.
  - Appending rows to a Google Sheet.

### Step 3: LangGraph & Agents

- Install `@langchain/google-genai` and `@langchain/langgraph`.
- Define the `State` interface for the LangGraph workflow.
- Implement nodes for Researcher, Tailor, and Critic.
- Implement conditional edges for the `< 93` score loop (max iterations = 3).
- Wrap in an API route (`app/api/tailor/route.ts`).

### Step 4: UI Refinement & Firebase

- Connect the frontend forms to the LangGraph API.
- Show realtime-esque status updates (e.g., "Researching...", "Tailoring...", "Scoring: 85, re-tailoring...").
- Initialize Firebase and configure Firebase App Hosting for Next.js.

## Verification Plan

### Manual Verification

1. Login to a test Google Account.
2. Provide a sample resume file, JD, and Company Name.
3. Observe the Multi-Agent loop logging state transitions.
4. Verify the output ATS score > 93.
5. Verify the tailored resume is saved in Google Drive.
6. Verify the application attempt is logged in Google Sheets.
7. Deploy to Firebase and test production behavior.
