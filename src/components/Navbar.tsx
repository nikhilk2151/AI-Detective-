'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  FolderLock, 
  UserCheck, 
  LogOut, 
  KeyRound, 
  Database, 
  Sparkles,
  CloudUpload,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCase } from '@/context/CaseContext';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentView: 'cases' | 'board' | 'terminal';
  setCurrentView: (view: 'cases' | 'board' | 'terminal') => void;
}

export default function Navbar({ currentView, setCurrentView }: NavbarProps) {
  const { user, signOut, isFirebaseActive } = useAuth();
  const { activeCase, isSyncing, syncWithFirestore } = useCase();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    try {
      const res = await fetch('/api/firestore/seed', { method: 'POST' });
      const data = await res.json();
      if (data.seededToFirestore) {
        setSeedStatus('Seeded to Firestore!');
      } else {
        setSeedStatus('Ready (Local/Memory Mode)');
      }
      setTimeout(() => setSeedStatus(null), 4000);
    } catch {
      setSeedStatus('Seeding error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-detective-950/90 backdrop-blur-md border-b border-detective-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('cases')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-glow text-detective-950">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wider text-slate-100 uppercase text-sm sm:text-base">
                  AI Detective
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  Mystery Solver
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Powered by Gemini 2.5 & Firebase
              </p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center bg-detective-900 border border-detective-800 p-1 rounded-xl">
            <button
              onClick={() => setCurrentView('cases')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'cases'
                  ? 'bg-amber-500 text-detective-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>Case Files</span>
            </button>

            <button
              onClick={() => setCurrentView('board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'board'
                  ? 'bg-amber-500 text-detective-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Investigation</span>
              <span>Board</span>
            </button>

            <button
              onClick={() => setCurrentView('terminal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'terminal'
                  ? 'bg-amber-500 text-detective-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sherlock</span>
              <span>Terminal</span>
            </button>
          </nav>

          {/* Right Action Tools & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Active Case Quick Tag */}
            {activeCase && (
              <div className="hidden lg:flex items-center space-x-2 bg-detective-900 border border-detective-800 px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate max-w-[160px]">{activeCase.title}</span>
              </div>
            )}

            {/* Sync Button */}
            <button
              onClick={syncWithFirestore}
              disabled={isSyncing}
              title="Save progress to Firestore"
              className="p-2 rounded-lg bg-detective-900 border border-detective-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Seed Button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              title="Seed or verify Firestore collections"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-detective-900 border border-detective-800 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSeeding ? 'Seeding...' : seedStatus || 'Seed DB'}</span>
            </button>

            {/* User Profile Badge or Login */}
            {user ? (
              <div className="flex items-center space-x-2 bg-detective-900 border border-detective-800 pl-2.5 pr-1.5 py-1 rounded-xl">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-end space-x-1">
                    <span>{user.displayName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  <div className="text-[10px] font-mono text-amber-400/90">
                    {user.badgeNumber}
                  </div>
                </div>

                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-detective-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-glow transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
}

