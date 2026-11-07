'use client';

import React, { useState, useEffect } from 'react';
import MyriNavbar from '@/components/MyriNavbar';
import AddNewCaseModal from '@/components/AddNewCaseModal';
import TutorialRoadmapModal from '@/components/TutorialRoadmapModal';
import CaseManagementModal from '@/components/CaseManagementModal';
import OnboardingProductTour, { OnboardingWelcomeToast } from '@/components/OnboardingProductTour';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import SuspectLineup from '@/components/SuspectLineup';
import EvidenceCluesList from '@/components/EvidenceCluesList';
import AiDetectiveChat from '@/components/AiDetectiveChat';
import AiVerdictModal from '@/components/AiVerdictModal';
import { useCase } from '@/context/CaseContext';
import { useAuth } from '@/context/AuthContext';
import { Suspect } from '@/types/detective';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Target, 
  ShieldAlert, 
  Gavel, 
  ArrowRight, 
  FolderPlus,
  FolderKanban,
  Compass, 
  CheckCircle2,
  Users,
  SearchCode,
  LogIn,
  Fingerprint
} from 'lucide-react';

export default function MysterySolverPage() {
  const { activeCase } = useCase();
  const { user } = useAuth();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isManageCasesOpen, setIsManageCasesOpen] = useState(false);
  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [targetSuspectForAccusation, setTargetSuspectForAccusation] = useState<Suspect | null>(null);

  // First Visit Workflow:
  // 1. Show Google Sign-In prompt on first visit
  // 2. Automatically launch the Product Tour after sign-in / continuation
  useEffect(() => {
    try {
      const firstVisitHandled = localStorage.getItem('myri_first_visit_handled');
      const tourSeen = localStorage.getItem('myri_tour_seen');

      if (!firstVisitHandled) {
        // First time visitor: show Google Sign-In on front page!
        const timer = setTimeout(() => {
          setIsSignInModalOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      } else if (!tourSeen) {
        // If already visited but tour wasn't completed, start tour automatically
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleSignInComplete = (startTourNow = true) => {
    try {
      localStorage.setItem('myri_first_visit_handled', 'true');
    } catch {}
    setIsSignInModalOpen(false);
    if (startTourNow) {
      setTimeout(() => {
        setIsTourOpen(true);
      }, 400);
    }
  };

  const handleAccuseSuspect = (suspect: Suspect) => {
    setTargetSuspectForAccusation(suspect);
    setIsVerdictModalOpen(true);
  };

  const handleOpenGlobalSolve = () => {
    setTargetSuspectForAccusation(null);
    setIsVerdictModalOpen(true);
  };

  const startInteractiveTour = () => {
    setShowWelcomeToast(false);
    setIsTourOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-white selection:bg-ai-blue selection:text-white">
      {/* 1. Brand Navbar */}
      <MyriNavbar
        onOpenHowItWorks={() => setIsTutorialOpen(true)}
        onOpenManageCases={() => setIsManageCasesOpen(true)}
        onOpenSolveModal={handleOpenGlobalSolve}
        onOpenAddCaseModal={() => setIsAddCaseOpen(true)}
        onStartTour={startInteractiveTour}
        onOpenSignIn={() => setIsSignInModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">

        {/* ============================================================ */}
        {/* FRONT-PAGE GOOGLE SIGN-IN BANNER (First Visit / Unauthenticated) */}
        {/* ============================================================ */}
        {!user && (
          <section className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/30 bg-gradient-to-r from-[#0d1527] via-[#101b33] to-[#0d1527] p-5 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                  <Fingerprint className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                      First Visit Detective Clearance
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">• Free-Tier Auth</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Sign in with your Google account
                  </h3>
                  <p className="text-xs text-slate-300">
                    Unlock official detective credentials, save case study reports in Firebase Firestore, and start the product tour.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* AUTHENTICATED DETECTIVE CLEARANCE BADGE (When Signed-In)     */}
        {/* ============================================================ */}
        {user && (
          <section className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-[#0d1527] via-[#101b33] to-[#0d1527] p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || 'Detective'}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-12 h-12 rounded-2xl border-2 border-cyan-400 object-cover shadow-lg shadow-cyan-500/20 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white uppercase shadow-lg shadow-cyan-500/20 shrink-0">
                  {user.displayName?.charAt(0) || 'D'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Active Forensic Clearance
                  </span>
                  <span className="text-xs text-cyan-300 font-mono">{user.badgeNumber}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Detective {user.displayName}</span>
                  <span className="text-xs font-normal text-slate-400">({user.rank})</span>
                </h3>
                <p className="text-xs text-slate-400">{user.email || 'Google Authentication Verified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-cyan-300/90 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-mono">
                Verified Detective Account
              </span>
            </div>
          </section>
        )}
        
        {/* ============================================================ */}
        {/* HERO SECTION: ACTIVE CASE OVERVIEW & QUICK SOLVE BANNER       */}
        {/* ============================================================ */}
        {activeCase && (
          <section id="tour-hero-briefing" className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 p-6 sm:p-10 shadow-2xl">
            {/* Background Glow Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-ai-blue/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-crime-red/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-ai-blue/15 text-ai-cyan border border-ai-blue/30 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Criminal Investigation</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-dark-950 border border-white/10 text-xs font-mono text-slate-300">
                  Difficulty: <strong className="text-white">{activeCase.difficulty}</strong>
                </span>

                <button
                  onClick={startInteractiveTour}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 border border-blue-500/40 text-xs text-blue-300 hover:text-white font-bold transition-all shadow-sm"
                  title="Launch Step-by-Step Onboarding Guide"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Product Tour</span>
                </button>

                <button
                  onClick={() => setIsAddCaseOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-ai-blue/10 hover:bg-ai-blue/20 border border-ai-blue/30 text-xs text-ai-cyan font-bold transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Create Custom Mystery</span>
                </button>

                <button
                  onClick={() => setIsManageCasesOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-ai-blue" />
                  <span>Manage Cases</span>
                </button>

                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 hover:text-white transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Roadmap & Tutorial</span>
                </button>
              </div>

              {/* Title & Briefing */}
              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {activeCase.title}
                </h1>
                <p className="text-base sm:text-lg text-ai-lightblue font-medium">
                  {activeCase.subtitle}
                </p>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  {activeCase.summary}
                </p>
              </div>

              {/* Key Incident Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-dark-950/80 border border-white/5 flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-ai-cyan shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Crime Scene / Location:</span>
                    <span className="text-slate-200 font-semibold">{activeCase.crimeScene}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-950/80 border border-white/5 flex items-start space-x-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Time Window:</span>
                    <span className="text-slate-200 font-semibold">{activeCase.timeOfCrime}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-950/80 border border-white/5 flex items-start space-x-2.5">
                  <Target className="w-4 h-4 text-crime-lightred shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target / Stolen Asset:</span>
                    <span className="text-slate-200 font-semibold">{activeCase.victimOrTarget}</span>
                  </div>
                </div>
              </div>

              {/* Fast Action Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="tour-solve-button"
                  onClick={handleOpenGlobalSolve}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-ai-blue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white font-extrabold text-sm shadow-blue-glow hover:shadow-red-glow transition-all flex items-center space-x-2"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Accuse Culprit & Solve Case</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsAddCaseOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-dark-900 hover:bg-dark-800 border border-white/10 hover:border-ai-cyan text-xs sm:text-sm font-bold text-slate-200 transition-all flex items-center space-x-2"
                >
                  <FolderPlus className="w-4 h-4 text-ai-cyan" />
                  <span>Add New Case</span>
                </button>

                <button
                  onClick={() => setIsManageCasesOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-dark-900 hover:bg-dark-800 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-2"
                >
                  <FolderKanban className="w-4 h-4 text-ai-blue" />
                  <span>Manage Cases</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 4-STEP INVESTIGATION ROADMAP SUMMARY (HUMANIZED VISUAL GUIDE) */}
        {/* ============================================================ */}
        <section id="tour-roadmap-section" className="bg-dark-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Investigation Master Roadmap & Tutorial</span>
            </h3>
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="text-xs text-ai-cyan hover:underline font-semibold flex items-center space-x-1"
            >
              <span>Open Step-by-Step Interactive Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              onClick={() => setIsAddCaseOpen(true)}
              className="p-4 rounded-2xl bg-dark-950 border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center font-bold text-xs mb-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                1
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Setup & Add Case
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Define crime location, time window, suspect check-in/out logs, and exhibit files.
              </p>
            </div>

            <div 
              onClick={() => setIsManageCasesOpen(true)}
              className="p-4 rounded-2xl bg-dark-950 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                2
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Manage All Cases
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Switch between archives, track solved status, or delete obsolete custom records.
              </p>
            </div>

            <div 
              onClick={() => {
                const el = document.getElementById('suspects-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-4 rounded-2xl bg-dark-950 border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs mb-2 group-hover:bg-amber-600 group-hover:text-white transition-all">
                3
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Find Suspects & Spot Lies
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Audit check-in/out timestamps and guidelines against evidence documents.
              </p>
            </div>

            <div 
              onClick={handleOpenGlobalSolve}
              className="p-4 rounded-2xl bg-dark-950 border border-white/5 hover:border-crime-red/30 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-crime-red/15 text-crime-lightred flex items-center justify-center font-bold text-xs mb-2 group-hover:bg-crime-red group-hover:text-white transition-all">
                4
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-crime-lightred transition-colors">
                Solve with Myri AI
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Interrogate Gemini AI, cite proof, and generate official verdict reports!
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SUSPECT LINEUP SECTION                                       */}
        {/* ============================================================ */}
        <section id="tour-suspects-section">
          <div id="suspects-section">
            <SuspectLineup onAccuse={handleAccuseSuspect} />
          </div>
        </section>

        {/* ============================================================ */}
        {/* CASE EVIDENCE & CLUES SECTION                                */}
        {/* ============================================================ */}
        <section id="tour-evidence-section">
          <div id="evidence-section">
            <EvidenceCluesList />
          </div>
        </section>

        {/* ============================================================ */}
        {/* MYRI AI DETECTIVE ASSISTANT & CHAT                           */}
        {/* ============================================================ */}
        <section id="tour-ai-chat-section">
          <div id="ai-chat-section">
            <AiDetectiveChat />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-dark-950 py-6 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-ai-blue" />
            <span className="font-bold text-slate-400">MYRI AI • Mystery Solver</span>
            <span>— Stored in Firestore Free Tier • Powered by Gemini 3</span>
          </div>
          <p>© 2026 AI Detective • Evidence-Grounded Crime Solver</p>
        </div>
      </footer>

      {/* Interactive Product Tour */}
      <OnboardingProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onFinish={() => {
          setIsTourOpen(false);
          const el = document.getElementById('tour-suspects-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Gentle First-Time Welcome Toast Prompt */}
      {showWelcomeToast && (
        <OnboardingWelcomeToast
          onStartTour={startInteractiveTour}
          onDismiss={() => {
            setShowWelcomeToast(false);
            try {
              localStorage.setItem('myri_tour_seen', 'true');
            } catch {}
          }}
        />
      )}

      {/* Interactive Modals */}
      <GoogleSignInModal
        isOpen={isSignInModalOpen}
        onClose={() => handleSignInComplete(true)}
        onSuccess={() => handleSignInComplete(true)}
      />

      <TutorialRoadmapModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onOpenAddNewCase={() => setIsAddCaseOpen(true)}
        onOpenManageCases={() => setIsManageCasesOpen(true)}
      />

      <CaseManagementModal
        isOpen={isManageCasesOpen}
        onClose={() => setIsManageCasesOpen(false)}
        onOpenAddNewCase={() => setIsAddCaseOpen(true)}
      />

      {isAddCaseOpen && (
        <AddNewCaseModal
          onClose={() => setIsAddCaseOpen(false)}
        />
      )}

      {isVerdictModalOpen && (
        <AiVerdictModal
          preselectedSuspect={targetSuspectForAccusation}
          onClose={() => {
            setIsVerdictModalOpen(false);
            setTargetSuspectForAccusation(null);
          }}
        />
      )}

    </div>
  );
}
