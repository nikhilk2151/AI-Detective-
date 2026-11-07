'use client';

import React, { useState } from 'react';
import { 
  FolderSearch, 
  MapPin, 
  Clock, 
  Target, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Users, 
  ChevronRight,
  ShieldCheck,
  Flame,
  Zap,
  Skull
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { MysteryCase, Difficulty } from '@/types/detective';

interface CaseSelectionViewProps {
  onOpenCase: (caseId: string) => void;
}

export default function CaseSelectionView({ onOpenCase }: CaseSelectionViewProps) {
  const { cases, activeCase, selectCase, solvedCases } = useCase();
  const [selectedPreviewCase, setSelectedPreviewCase] = useState<MysteryCase | null>(null);

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3 h-3" />
            <span>Easy (Standard Clues)</span>
          </span>
        );
      case 'Twisted':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-3 h-3" />
            <span>Twisted (Red Herrings)</span>
          </span>
        );
      case 'Impossible':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Skull className="w-3 h-3" />
            <span>Impossible (Grand Heist)</span>
          </span>
        );
    }
  };

  const handleLaunchCase = (caseId: string) => {
    selectCase(caseId);
    onOpenCase(caseId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner / Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-detective-800 bg-gradient-to-r from-detective-950 via-detective-900 to-detective-950 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-detective-800/80 border border-detective-700 text-xs font-mono text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTIVE DOSSIER ARCHIVE • 3 CRIMINAL INCIDENTS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Solve Crimes with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Evidence-Grounded AI
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome, Sleuth. Cross-examine witness statements, surveillance telemetry, and keycard logs.
            Spot hidden contradictions, expose fraudulent alibis, and generate a finalized prosecution dossier.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Document Ingestion</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gemini Structured Output Reasoning</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strict Citation Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Grid Header */}
      <div className="flex items-center justify-between border-b border-detective-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase flex items-center space-x-2">
            <FolderSearch className="w-5 h-5 text-amber-400" />
            <span>Classified Case Files</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Select an active investigation to inspect exhibits and begin cross-examination
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-detective-900 border border-detective-800 px-3 py-1.5 rounded-lg hidden sm:block">
          Solved: <span className="text-amber-400 font-bold">{Object.keys(solvedCases).length}</span> / {cases.length}
        </div>
      </div>

      {/* Cases Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => {
          const isSolved = solvedCases[c.id];
          const isCurrent = activeCase?.id === c.id;

          return (
            <div
              key={c.id}
              className={`group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-detective-900/80 hover:bg-detective-850 hover:shadow-2xl ${
                isCurrent
                  ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'border-detective-800 hover:border-detective-700'
              }`}
            >
              {/* Card Thumbnail / Header */}
              <div className="relative h-48 overflow-hidden bg-detective-950">
                <img
                  src={c.coverImage}
                  alt={c.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-detective-900 via-detective-900/40 to-transparent" />

                {/* Difficulty Pill */}
                <div className="absolute top-3 left-3">{getDifficultyBadge(c.difficulty)}</div>

                {/* Status Pill */}
                <div className="absolute top-3 right-3">
                  {isSolved ? (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SOLVED</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-detective-950/80 text-slate-300 border border-slate-700">
                      OPEN DOSSIER
                    </span>
                  )}
                </div>

                {/* Case Title Overlay */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-bold text-slate-100 drop-shadow-md">
                    {c.title}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono drop-shadow">
                    {c.subtitle}
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {c.summary}
                </p>

                {/* Quick Meta Details */}
                <div className="space-y-2 text-xs font-mono text-slate-400 bg-detective-950/60 p-3 rounded-xl border border-detective-800/80">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="truncate">{c.crimeScene}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.timeOfCrime}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.victimOrTarget}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-detective-800 text-slate-300 border border-detective-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-detective-800 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPreviewCase(c)}
                    className="flex-1 py-2 px-3 rounded-xl border border-detective-700 hover:border-slate-500 bg-detective-950 text-xs font-mono text-slate-300 hover:text-slate-100 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Read Briefing</span>
                  </button>

                  <button
                    onClick={() => handleLaunchCase(c.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-detective-950 font-bold text-xs shadow-glow transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Briefing Modal */}
      {selectedPreviewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-detective-900 border border-detective-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 relative text-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {getDifficultyBadge(selectedPreviewCase.difficulty)}
                  <span className="text-xs font-mono text-slate-400">CASE ID: {selectedPreviewCase.id}</span>
                </div>
                <h2 className="text-2xl font-bold">{selectedPreviewCase.title}</h2>
                <p className="text-sm text-amber-400 font-mono">{selectedPreviewCase.subtitle}</p>
              </div>

              <button
                onClick={() => setSelectedPreviewCase(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-detective-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-detective-950 border border-detective-800 text-sm leading-relaxed text-slate-300 space-y-3">
              <h4 className="text-xs font-mono uppercase text-amber-400 tracking-wider font-bold">
                Incident Dossier Briefing:
              </h4>
              <p>{selectedPreviewCase.dossierBriefing}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-detective-950 border border-detective-800">
                <span className="text-slate-400 block mb-0.5">Crime Scene:</span>
                <span className="text-slate-200 font-bold">{selectedPreviewCase.crimeScene}</span>
              </div>
              <div className="p-3 rounded-lg bg-detective-950 border border-detective-800">
                <span className="text-slate-400 block mb-0.5">Time of Incident:</span>
                <span className="text-slate-200 font-bold">{selectedPreviewCase.timeOfCrime}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-detective-800">
              <button
                onClick={() => setSelectedPreviewCase(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleLaunchCase(selectedPreviewCase.id);
                  setSelectedPreviewCase(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-detective-950 font-bold text-xs shadow-glow transition-all flex items-center space-x-2"
              >
                <span>Enter Crime Scene</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

