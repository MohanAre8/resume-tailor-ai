'use client';

import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';

interface HeaderProps {
  session: Session;
}

export default function Header({ session }: HeaderProps) {
  return (
    <header className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex flex-col">
         <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">AI Resume Agent</h1>
         <span className="text-xs text-slate-400">Privacy First Workflow</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{session.user?.email}</span>
        <button onClick={() => signOut()} className="text-sm text-red-400 hover:text-red-300">Sign Out</button>
      </div>
    </header>
  );
}
