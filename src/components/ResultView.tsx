"use client";

import ReactMarkdown from "react-markdown";

interface ResultViewProps {
  result: any;
}

export default function ResultView({ result }: ResultViewProps) {
  if (!result) return null;

  // Parse research insights to extract keywords
  let keywordsFromResearch: string[] = [];
  try {
    if (result.researchInsights) {
      const parsed = JSON.parse(result.researchInsights);
      keywordsFromResearch = parsed.keywords || [];
    }
  } catch (e) {
    // Fallback if JSON parsing fails
  }

  // Build score progression display
  const originalScore = result.originalScore || 0;
  const finalScore = result.finalScore || 0;
  const scoreImprovement = finalScore - originalScore;
  const improvementPercent =
    originalScore > 0
      ? ((scoreImprovement / originalScore) * 100).toFixed(1)
      : 0;

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
      {/* Header with Score */}
      <div className="p-8 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-transparent">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Tailoring Complete
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Processed in {result.iterations} iteration
              {result.iterations !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Final ATS Match
            </div>
            <div
              className={`text-4xl font-black ${finalScore >= 90 ? "text-green-400" : finalScore >= 80 ? "text-blue-400" : "text-yellow-400"}`}
            >
              {finalScore}%
            </div>
          </div>
        </div>

        {/* Score Progression */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Score Progression
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-xs text-slate-500">Before Tailoring</div>
              <div className="text-lg font-bold text-slate-400">
                {originalScore}%
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gradient-to-r from-slate-600 to-green-500 rounded-full"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-green-400"
              >
                <polyline points="13 17 20 10 13 3"></polyline>
                <polyline points="20 10 0 10"></polyline>
              </svg>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">After Tailoring</div>
              <div className="text-lg font-bold text-green-400">
                {finalScore}%
              </div>
            </div>
          </div>
          {scoreImprovement > 0 && (
            <p className="text-xs text-green-400 mt-2">
              ↑ Improved by {scoreImprovement} points ({improvementPercent}%)
            </p>
          )}
          {scoreImprovement === 0 && (
            <p className="text-xs text-slate-400 mt-2">
              No change needed - resume already well optimized
            </p>
          )}
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Feedback & Key Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critic Feedback */}
          {result.criticFeedback && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
              <div className="flex gap-3 items-start">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                    Improvement Details
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {result.criticFeedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Keywords Matched */}
          {keywordsFromResearch.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
              <div className="mb-3">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Key Terms Integrated
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywordsFromResearch.slice(0, 8).map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              {keywordsFromResearch.length > 8 && (
                <p className="text-xs text-slate-400 mt-2">
                  +{keywordsFromResearch.length - 8} more terms matched
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Link */}
        {result.driveUrl && (
          <a
            href={result.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-4 bg-green-500 hover:bg-green-400 text-slate-950 font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Tailored Resume from Drive
          </a>
        )}

        {/* Formatted Resume Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Tailored Resume Preview
            </h3>
            <span className="text-xs text-slate-500">Formatted View</span>
          </div>
          <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Resume Container */}
            <div className="p-12 prose prose-sm prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-blue-600 prose-strong:text-slate-900 prose-code:bg-slate-100 prose-code:text-slate-700 max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl font-black text-center mb-1 text-slate-900"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-lg font-bold border-b border-slate-300 pb-2 mt-6 mb-3 text-slate-900"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-sm font-bold text-slate-800 mt-3 mb-2"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-sm text-slate-700 leading-relaxed my-2"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside text-sm text-slate-700 space-y-1 my-2"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-slate-700" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-slate-900" {...props} />
                  ),
                }}
              >
                {result.tailoredResume}
              </ReactMarkdown>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">
            This is how your resume will appear to ATS systems and hiring
            managers
          </p>
        </section>
      </div>
    </div>
  );
}
