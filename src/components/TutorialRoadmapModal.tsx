'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  FolderPlus, 
  FolderKanban, 
  UserSearch, 
  Sparkles, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Bot, 
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface TutorialRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddNewCase?: () => void;
  onOpenManageCases?: () => void;
}

export default function TutorialRoadmapModal({
  isOpen,
  onClose,
  onOpenAddNewCase,
  onOpenManageCases,
}: TutorialRoadmapModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'setup-case',
      stepNumber: '01',
      title: 'How to Setup & Add a New Case',
      badge: 'Step 1: Case Creation',
      icon: FolderPlus,
      color: 'blue',
      summary: 'Design custom crime mysteries with custom suspects, timeline logs, and evidence exhibits.',
      details: [
        {
          heading: '1. Incident Problem & Location',
          desc: 'Specify what crime occurred (e.g. theft, leak, disappearance), the exact lost location (e.g. Vault B-4, Penthouse Suite), and the critical incident timestamp window.',
          icon: MapPin,
        },
        {
          heading: '2. Suspect Profiles & Check-in / Check-out Times',
          desc: 'Define each suspect with specific entry/exit timestamps (e.g., Check-in 20:45, Check-out 21:15), motive, alibi, and behavioural guidelines (habits, stress reactions, tells).',
          icon: Clock,
        },
        {
          heading: '3. Evidence Documents & Hidden Culprit',
          desc: 'Add exhibits (witness transcripts, CCTV logs, access badges) and secretly mark the true culprit for automated AI scoring.',
          icon: FileText,
        },
      ],
      quickTip: 'Tip: Ensure at least one suspect has an alibi that clashes directly with an access log or CCTV exhibit timestamp!',
      actionLabel: 'Launch Case Creator Now',
      actionHandler: () => {
        onClose();
        if (onOpenAddNewCase) onOpenAddNewCase();
      },
    },
    {
      id: 'manage-case',
      stepNumber: '02',
      title: 'How to Manage & Switch Cases',
      badge: 'Step 2: Case Management',
      icon: FolderKanban,
      color: 'indigo',
      summary: 'Organize your crime archive, filter difficulty, inspect solved status, and remove custom records.',
      details: [
        {
          heading: '1. Instant Switching via Brand Header',
          desc: 'Use the case selector in the top navigation bar to jump seamlessly between Pre-loaded Cases (The Missing Laptop, Corporate Leak, Art Gallery Heist) and your custom cases.',
          icon: FolderKanban,
        },
        {
          heading: '2. Case Management Dashboard',
          desc: 'Open the "Manage Cases" modal to view stats: total active cases, solved status badges, suspect tallies, and creation dates.',
          icon: ShieldCheck,
        },
        {
          heading: '3. Safe Deletion & Text-Only Storage',
          desc: 'Remove custom cases in 1 click. All cases are lightweight and stored as clean text in Firebase Firestore and browser cache — zero bloat or image upload costs.',
          icon: AlertTriangle,
        },
      ],
      quickTip: 'Tip: Solved cases receive a permanent green "SOLVED" badge, and your interrogation progress is saved automatically.',
      actionLabel: 'Open Case Manager',
      actionHandler: () => {
        onClose();
        if (onOpenManageCases) onOpenManageCases();
      },
    },
    {
      id: 'find-suspects',
      stepNumber: '03',
      title: 'How to Find Suspects & Spot Lies',
      badge: 'Step 3: Suspect Analysis',
      icon: UserSearch,
      color: 'red',
      summary: 'Compare timestamps, review behavioral guidelines, and uncover fabricated alibis.',
      details: [
        {
          heading: '1. Check-In & Check-Out Audit',
          desc: 'Examine each suspect’s card on the right panel. Check their exact Check-In/Check-Out timestamps against exhibit logs (e.g. keycard swiping logs or CCTV frames).',
          icon: Clock,
        },
        {
          heading: '2. Psychological Guidelines & Tells',
          desc: 'Read the "Investigator Guidelines" on each suspect card to catch behavioral anomalies, nervousness, or shifting stories.',
          icon: AlertTriangle,
        },
        {
          heading: '3. Spotting Direct Contradictions',
          desc: 'Look at the Center Contradiction Board. When a suspect claims they were at dinner, but the badge log places them near the server room, flag them as Prime Suspect!',
          icon: CheckCircle2,
        },
      ],
      quickTip: 'Tip: Adjust the Blame Slider on suspect cards to visually isolate prime targets and prioritize interrogation.',
      actionLabel: null,
      actionHandler: null,
    },
    {
      id: 'solve-with-ai',
      stepNumber: '04',
      title: 'How to Solve the Case with Myri AI',
      badge: 'Step 4: AI Resolution',
      icon: Sparkles,
      color: 'emerald',
      summary: 'Interrogate Gemini AI, extract hidden timeline clues, and trigger the official verdict report.',
      details: [
        {
          heading: '1. AI Document Entity Extraction',
          desc: 'Click "Extract Entities" on any document. Gemini reads the file and extracts all people, timestamps, and locations into clean JSON schema tags.',
          icon: FileText,
        },
        {
          heading: '2. Interrogate the AI Detective Terminal',
          desc: 'Ask Myri AI any investigative query. The AI provides strict citation tags like [DOC-01] or [DOC-02] so every fact is grounded in physical evidence.',
          icon: Bot,
        },
        {
          heading: '3. Deliver Verdict & Indict Culprit',
          desc: 'Click "Accuse This Suspect" or "Submit Case Indictment". Gemini evaluates the entire case file, reveals the culprit, scores your accuracy, and generates an official closure report.',
          icon: Sparkles,
        },
      ],
      quickTip: 'Tip: If Gemini models experience high traffic, Myri AI automatically cascades through backup engines to ensure your case gets solved!',
      actionLabel: 'Dive Right into Investigation',
      actionHandler: () => {
        onClose();
      },
    },
  ];

  const currentData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0d0f14] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Master Detective Roadmap & Tutorial
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Interactive Guide
                </span>
              </div>
              <p className="text-xs text-white/50">
                Learn how to add, manage, investigate, and solve any mystery with Myri AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
              title="Skip tutorial and start investigating immediately"
            >
              <span>Skip / Direct to App</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progression Bar / Clickable Tabs */}
        <div className="grid grid-cols-4 border-b border-white/10 bg-black/40">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`py-3 px-3 text-left transition-all relative flex items-center gap-2.5 sm:gap-3 ${
                  isActive 
                    ? 'bg-blue-600/10 text-white border-b-2 border-blue-500' 
                    : isCompleted
                      ? 'text-white/80 hover:bg-white/[0.02]'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                }`}
              >
                <div 
                  className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : isCompleted
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.stepNumber}
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    Step {idx + 1}
                  </div>
                  <div className="text-xs font-medium truncate">
                    {s.title.replace('How to ', '')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step Header Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 via-slate-900/40 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                {currentData.badge}
              </span>
              <h3 className="text-xl font-bold text-white">
                {currentData.title}
              </h3>
              <p className="text-xs text-white/60">
                {currentData.summary}
              </p>
            </div>

            {currentData.actionLabel && currentData.actionHandler && (
              <button
                onClick={currentData.actionHandler}
                className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>{currentData.actionLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Detailed Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentData.details.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div 
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      {item.heading}
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tip Box */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
              {currentData.quickTip}
            </p>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3.5 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6 bg-blue-500' 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish Tutorial & Solve Case</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

