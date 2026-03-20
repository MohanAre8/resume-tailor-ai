'use client';

interface TerminalLogProps {
  statusLog: string[];
  loading: boolean;
}

export default function TerminalLog({ statusLog, loading }: TerminalLogProps) {
  return (
    <div className="bg-slate-900/80 border border-indigo-500/30 p-6 rounded-3xl h-64 overflow-y-auto font-mono text-sm text-green-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
       <div className="text-slate-500 mb-4 border-b border-slate-800 pb-2">Terminal Output</div>
       {statusLog.map((log, i) => (
         <div key={i} className="mb-2 opacity-90 animate-pulse">
           <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
         </div>
       ))}
       {!loading && statusLog.length === 0 && (
         <div className="text-slate-600 text-center mt-10">System Ready. Waiting for inputs.</div>
       )}
    </div>
  );
}
