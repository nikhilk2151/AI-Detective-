'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  Gavel, 
  ChevronDown, 
  FolderSearch,
  FolderPlus,
  FolderKanban,
  CheckCircle2,
  Flame,
  Zap,
  Skull,
  Compass,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { useAuth } from '@/context/AuthContext';

interface MyriNavbarProps {
  onOpenHowItWorks: () => void;
  onOpenManageCases: () => void;
  onOpenSolveModal: () => void;
  onOpenAddCaseModal: () => void;
  onStartTour?: () => void;
  onOpenSignIn?: () => void;
}

export default function MyriNavbar({ 
  onOpenHowItWorks, 
  onOpenManageCases, 
  onOpenSolveModal, 
  onOpenAddCaseModal,
  onStartTour,
  onOpenSignIn
}: MyriNavbarProps) {
  const { cases, activeCase, selectCase, solvedCases } = useCase();
  const { user, signOut } = useAuth();
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Reset error state if avatar URL changes
  React.useEffect(() => {
    setAvatarError(false);
  }, [user?.avatarUrl]);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Easy</span>;
      case 'Twisted':
        return <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Twisted</span>;
      case 'Impossible':
        return <span className="text-[10px] font-bold text-crime-lightred bg-crime-red/10 px-2 py-0.5 rounded border border-crime-red/20">Hard</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ai-darkblue via-ai-blue to-crime-red p-[1.5px] shadow-blue-glow">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-crime-red" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                MYRI <span className="text-ai-blue">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-crime-red/20 text-crime-lightred border border-crime-red/30 px-2 py-0.5 rounded font-bold">
                Mystery Solver
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AI Detective & Lie Detector
            </p>
          </div>
        </div>

        {/* Case Selector Dropdown */}
        <div className="relative">
          <button
            id="tour-case-selector"
            onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
            className="flex items-center space-x-2.5 bg-dark-900 hover:bg-dark-850 border border-white/10 hover:border-ai-blue/40 px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-sm"
          >
            <FolderSearch className="w-4 h-4 text-ai-blue" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 block uppercase">Current Case:</span>
              <span className="font-bold text-white truncate max-w-[180px] block">
                {activeCase?.title || 'Select Case'}
              </span>
            </div>
            <span className="font-bold text-white sm:hidden truncate max-w-[120px]">
              {activeCase?.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isCaseDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-72 bg-dark-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                <span>Select Mystery</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsCaseDropdownOpen(false);
                      onOpenManageCases();
                    }}
                    className="text-ai-cyan hover:underline font-bold flex items-center space-x-1"
                  >
                    <FolderKanban className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      setIsCaseDropdownOpen(false);
                      onOpenAddCaseModal();
                    }}
                    className="text-ai-cyan hover:underline font-bold flex items-center space-x-1"
                  >
                    <FolderPlus className="w-3 h-3" />
                    <span>+ New</span>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {cases.map((c) => {
                  const isCurrent = activeCase?.id === c.id;
                  const isSolved = solvedCases[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        selectCase(c.id);
                        setIsCaseDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-ai-blue/15 border border-ai-blue/40 text-white'
                          : 'hover:bg-dark-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{c.title}</span>
                          {getDifficultyBadge(c.difficulty)}
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {c.subtitle}
                        </span>
                      </div>
                      {isSolved && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Add Case, Manage, Product Tour, Roadmap & Solve Case CTA */}
        <div className="flex items-center space-x-2 sm:space-x-2">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all shadow-sm"
              title="Start Interactive Product Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Product Tour</span>
            </button>
          )}

          <button
            id="tour-add-case"
            onClick={onOpenAddCaseModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-dark-900 hover:bg-dark-850 border border-white/10 text-ai-cyan hover:border-ai-cyan/40 text-xs font-semibold transition-colors"
            title="Create a new custom mystery case"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden md:inline">Add Case</span>
          </button>

          <button
            onClick={onOpenManageCases}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-dark-900 hover:bg-dark-850 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Manage all cases and archives"
          >
            <FolderKanban className="w-4 h-4 text-ai-blue" />
            <span className="hidden lg:inline">Manage</span>
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-dark-900 hover:bg-dark-850 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Open Tutorial Roadmap & Guide"
          >
            <Compass className="w-4 h-4 text-ai-cyan" />
            <span className="hidden xl:inline">Roadmap</span>
          </button>

          <button
            onClick={onOpenSolveModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-ai-blue via-ai-darkblue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white font-extrabold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-blue-glow hover:shadow-red-glow transition-all"
          >
            <Gavel className="w-4 h-4" />
            <span>Solve Case</span>
          </button>

          {/* User Profile or Google Sign-In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 bg-dark-900 hover:bg-dark-850 border border-white/10 hover:border-cyan-400/50 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all"
                title="Investigator Profile"
              >
                {user.avatarUrl && !avatarError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || 'Detective'}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setAvatarError(true)}
                    className="w-6 h-6 rounded-full border border-cyan-400 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                    {user.displayName?.charAt(0) || 'D'}
                  </div>
                )}
                <span className="text-xs font-bold text-white hidden md:inline truncate max-w-[100px]">
                  {user.displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-dark-900 border border-white/10 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3 text-xs">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
                    {user.avatarUrl && !avatarError ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName || 'Detective'}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-10 h-10 rounded-full border border-cyan-400 object-cover shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white uppercase shrink-0">
                        {user.displayName?.charAt(0) || 'D'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate text-xs">{user.displayName}</p>
                      <p className="text-[10px] text-cyan-300 font-mono truncate">{user.badgeNumber}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email || 'Guest Session'}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsProfileDropdownOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Sign in with Google"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
