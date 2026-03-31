'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import SignInPrompt from '@/components/SignInPrompt';
import Header from '@/components/Header';
import TailorInputForm from '@/components/TailorInputForm';
import TerminalLog from '@/components/TerminalLog';
import ResultView from '@/components/ResultView';

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  
  const [baseResumeFileId, setBaseResumeFileId] = useState('');
  const [baseResumeName, setBaseResumeName] = useState('');
  
  const [trackingSheetId, setTrackingSheetId] = useState('');
  const [trackingSheetName, setTrackingSheetName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleTailor = async () => {
    if (!company || !role || !jd || !baseResumeFileId) {
      alert("Please fill all required fields and select a Base Resume.");
      return;
    }
    
    setLoading(true);
    setResult(null);
    setStatusLog(["Initializing Multi-Agent Workflow..."]);
    
    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyName: company, 
          jobDescription: `${role}\n\n${jd}`, 
          baseResumeFileId,
          trackingSheetId 
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.error) {
              setStatusLog(prev => [...prev, `❌ Error: ${data.error}`]);
              setLoading(false);
              return;
            }
            if (data.status) {
              setStatusLog(prev => [...prev, data.status]);
            }
            if (data.done) {
              setStatusLog(prev => [...prev, `✅ Process complete! Final Score: ${data.finalScore}`]);
              setResult(data);
            }
          } catch (e) {
            console.error("Error parsing stream line:", e);
          }
        }
      }
    } catch (err: any) {
      setStatusLog(prev => [...prev, `⚠️ System Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <SignInPrompt />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header session={session} />

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TailorInputForm 
            company={company} setCompany={setCompany}
            role={role} setRole={setRole}
            jd={jd} setJd={setJd}
            baseResumeFileId={baseResumeFileId} setBaseResumeFileId={setBaseResumeFileId}
            baseResumeName={baseResumeName} setBaseResumeName={setBaseResumeName}
            trackingSheetId={trackingSheetId} setTrackingSheetId={setTrackingSheetId}
            trackingSheetName={trackingSheetName} setTrackingSheetName={setTrackingSheetName}
            loading={loading} handleTailor={handleTailor}
          />

          <div className="space-y-6">
            <TerminalLog statusLog={statusLog} loading={loading} />
            <ResultView result={result} />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: '#334155',
        fontSize: '13px',
      }}>
        Resume Tailor AI &nbsp;·&nbsp;{' '}
        <a href="/privacy" style={{ color: '#4ade80', textDecoration: 'none' }}>
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}
