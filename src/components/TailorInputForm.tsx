'use client';

import { useState } from 'react';
import GoogleDrivePicker from './GoogleDrivePicker';

interface TailorInputFormProps {
  company: string;
  setCompany: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  jd: string;
  setJd: (val: string) => void;
  
  baseResumeFileId: string;
  setBaseResumeFileId: (val: string) => void;
  baseResumeName: string;
  setBaseResumeName: (val: string) => void;
  
  trackingSheetId: string;
  setTrackingSheetId: (val: string) => void;
  trackingSheetName: string;
  setTrackingSheetName: (val: string) => void;
  
  loading: boolean;
  handleTailor: () => void;
}

export default function TailorInputForm({
  company, setCompany,
  role, setRole,
  jd, setJd,
  baseResumeFileId, setBaseResumeFileId,
  baseResumeName, setBaseResumeName,
  trackingSheetId, setTrackingSheetId,
  trackingSheetName, setTrackingSheetName,
  loading, handleTailor
}: TailorInputFormProps) {

  return (
    <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
      <h2 className="text-2xl font-bold">1. Application Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Company Name</label>
          <input 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-600"
            placeholder="e.g. Google, Stripe"
            value={company} onChange={e => setCompany(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Role Title</label>
          <input 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-600"
            placeholder="e.g. Senior Frontend Engineer"
            value={role} onChange={e => setRole(e.target.value)}
          />
        </div>

         <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Job Description</label>
          <textarea 
            className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-600 resize-none font-mono text-sm"
            placeholder="Paste the full JD here..."
            value={jd} onChange={e => setJd(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="block text-sm font-medium text-slate-400">Select Base Resume (Google Doc)</label>
          {baseResumeFileId ? (
            <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/50 rounded-xl p-3">
              <span className="text-emerald-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {baseResumeName}
              </span>
              <button onClick={() => { setBaseResumeFileId(""); setBaseResumeName(""); }} className="text-slate-400 hover:text-white text-sm">Change</button>
            </div>
          ) : (
            <GoogleDrivePicker 
              label="Select Resume from Drive" 
              onFileSelect={(id, name) => { setBaseResumeFileId(id); setBaseResumeName(name); }} 
            />
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="block text-sm font-medium text-slate-400">Tracking Sheet (Optional - Will auto-create if empty)</label>
          {trackingSheetId ? (
            <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/50 rounded-xl p-3">
              <span className="text-emerald-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {trackingSheetName}
              </span>
              <button onClick={() => { setTrackingSheetId(""); setTrackingSheetName(""); }} className="text-slate-400 hover:text-white text-sm">Change</button>
            </div>
          ) : (
            <GoogleDrivePicker 
              label="Select Tracking Sheet" 
              mimeTypeMask="application/vnd.google-apps.spreadsheet"
              onFileSelect={(id, name) => { setTrackingSheetId(id); setTrackingSheetName(name); }} 
            />
          )}
        </div>
      </div>

      <button 
        onClick={handleTailor}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all mt-4 ${loading ? 'bg-indigo-500/50 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(79,70,229,0.4)]'}`}
      >
        {loading ? 'Agents Working...' : 'Start Multi-Agent Tailoring'}
      </button>
    </div>
  );
}
