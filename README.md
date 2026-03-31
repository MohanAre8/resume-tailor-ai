# 🚀 AI-Powered Resume Builder & Tailor

A sophisticated multi-agent system built with **Next.js**, **LangGraph**, and **Groq** to intelligently tailor resumes for specific job descriptions.

# 🔗 Live Demo: https://resume-aiagent.vercel.app
📄 Architecture Docs: See /docs folder

## 🌟 Features
- **Researcher Agent**: Uses **Tavily Web Search** to find implicit company requirements and real-world tech stack insights.
- **Tailor Agent**: Rewrites resume bullets using high-impact [Action Verb] + [How/Tech] + [Metric] structure.
- **Conciseness Agent**: Optimizes resume length to 1-2 pages while preserving all critical sections.
- **ATS Critic**: Evaluates and scores your resume based on recruiter standards (aiming for 90+ score).
- **Google Drive Integration**: Select base resumes directly from Drive and save tailored results automatically.
- **Job Tracker**: Automatically logs application details into a Google Tracking Sheet.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **AI Orchestration**: LangGraph.js & LangChain
- **Models**: Groq (Llama 3.3 70B & 3.1 8B)
- **Search**: Tavily Search API
- **Auth & Storage**: Google OAuth, Drive API, & Sheets API
- **Styling**: Tailwind CSS 4 (Premium Glassmorphic Design)

## 📁 Project Structure
- `src/lib/agents`: The "Brain" (Nodes, Graph, State)
- `src/lib/llm`: AI model configurations
- `src/components`: Premium UI components (Google Drive Picker, Result View, Terminal Log)
- `docs/`: Technical documentation and implementation history

## 🚀 Getting Started
1. **Clone the repo**
2. **Setup Secrets**: Copy `.env.example` to `.env.local` and add your API keys.
3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## 📄 Documentation
Comprehensive architecture details and deployment guides can be found in the [docs/](file:///Users/mohanareti/CodeBAse/Agent/resumebuilder/docs) folder.

---
*Created with ❤️ for technical excellence in job applications.*
