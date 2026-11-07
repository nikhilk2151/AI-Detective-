'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Gavel, 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  FileCheck, 
  Copy, 
  Check, 
  ArrowRight,
  Loader2,
  Share2,
  RefreshCw
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { Suspect, FinalReport } from '@/types/detective';

interface FinalReportModalProps {
  initialAccusedSuspect?: Suspect | null;
  onClose: () => void;
}

export default function FinalReportModal({ initialAccusedSuspect, onClose }: FinalReportModalProps) {
  const { 
    activeCase, 
    suspects, 
    generateReport, 
    isGeneratingReport, 
    finalReport,
    userNotes,
    setUserNotes
  } = useCase();

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(
    initialAccusedSuspect?.id || suspects[0]?.id || ''
  );
  const [deductionNotes, setDeductionNotes] = useState(userNotes || '');
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on SOLVED verdict
  useEffect(() => {
    if (finalReport && finalReport.verdict === 'SOLVED') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#eab308', '#f59e0b', '#10b981', '#06b6d4'],
      });
    }
  }, [finalReport]);

  const handleExecuteIndictment = async () => {
    if (!selectedSuspectId) return;
    setUserNotes(deductionNotes);
    await generateReport(selectedSuspectId, deductionNotes);
  };

  const handleCopyReport = () => {
    if (!finalReport) return;
    const text = `=== OFFICIAL DEPARTMENT OF INVESTIGATION DOSSIER ===
Case: ${activeCase?.title}
Target Suspect: ${finalReport.accusedSuspectName}
Verdict: ${finalReport.verdict} (${finalReport.aiDetectiveGrade})
Accuracy Rating: ${finalReport.accuracyScore}%

[EXECUTIVE SUMMARY]
${finalReport.executiveSummary}

[EVIDENCE TRAIL]
${finalReport.evidenceTrail.map((e, i) => `${i + 1}. ${e}`).join('\n')}

[CONTRADICTIONS EXPOSED]
${finalReport.contradictionBreakdown.map((c, i) => `${i + 1}. ${c}`).join('\n')}

[MOTIVE & OPPORTUNITY EVALUATION]
${finalReport.motiveBreakdown}

Certified by Gemini AI Forensic Engine
Timestamp: ${finalReport.timestamp}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const accusedSuspect = suspects.find((s) => s.id === selectedSuspectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-detective-900 border border-detective-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Top Header */}
        <div className="p-5 bg-detective-950 border-b border-detective-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-crimson">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-slate-100">
                Official Case Prosecution & Verdict
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Case ID: {activeCase?.id} • Synthesized via Gemini 2.5
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-detective-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!finalReport ? (
            /* PHASE 1: Accusation Form */
            <div className="space-y-5">
              <div className="bg-detective-950 p-4 rounded-2xl border border-detective-800 space-y-2">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                  Select the Prime Culprit to Indict:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suspects.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSuspectId(s.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                        selectedSuspectId === s.id
                          ? 'bg-rose-500/10 border-rose-500/60 ring-1 ring-rose-500/40 shadow-crimson'
                          : 'bg-detective-900 border-detective-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{s.name}</h4>
                          <span className="text-[10px] font-mono text-amber-400 font-extrabold">
                            {s.blameConfidence}%
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{s.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accused Summary Box */}
              {accusedSuspect && (
                <div className="bg-detective-950/60 p-4 rounded-2xl border border-detective-800/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Motive: {accusedSuspect.motiveScore}%</span>
                    <span>Opportunity: {accusedSuspect.opportunityScore}%</span>
                    <span>Alibi: {accusedSuspect.alibiSolidness}%</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs italic">
                    "{accusedSuspect.alibi}"
                  </p>
                </div>
              )}

              {/* Investigator Reasoning Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-400">
                  Investigator's Evidentiary Deduction (Optional):
                </label>
                <textarea
                  rows={4}
                  value={deductionNotes}
                  onChange={(e) => setDeductionNotes(e.target.value)}
                  placeholder="Outline your deduction: e.g. Maya Chen's dinner claim was contradicted by the boardroom Wi-Fi IP and the janitor eyewitness testimony..."
                  className="w-full bg-detective-950 border border-detective-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              {/* Execution Button */}
              <button
                onClick={handleExecuteIndictment}
                disabled={isGeneratingReport || !selectedSuspectId}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-slate-950 font-extrabold text-sm shadow-crimson transition-all flex items-center justify-center space-x-2"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Synthesizing Full Dossier...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Issue Official Indictment & Produce Report</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* PHASE 2: Final Report Display */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Verdict Header Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                  finalReport.verdict === 'SOLVED'
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-glow'
                    : 'bg-rose-950/20 border-rose-500/50 shadow-crimson'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                      finalReport.verdict === 'SOLVED'
                        ? 'bg-emerald-500 text-detective-950'
                        : 'bg-rose-500 text-slate-100'
                    }`}
                  >
                    {finalReport.verdict === 'SOLVED' ? (
                      <ShieldCheck className="w-7 h-7" />
                    ) : (
                      <AlertTriangle className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-extrabold tracking-wider">
                        VERDICT: {finalReport.verdict}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-detective-950 border border-slate-700 text-amber-400">
                        {finalReport.aiDetectiveGrade}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-300">
                      Accused: <strong className="text-slate-100">{finalReport.accusedSuspectName}</strong> • Accuracy Score: {finalReport.accuracyScore}%
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Forensic Accuracy
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-400">
                    {finalReport.accuracyScore}%
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-detective-950 p-4 rounded-2xl border border-detective-800 space-y-2">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center space-x-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Executive Prosecution Summary:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {finalReport.executiveSummary}
                </p>
              </div>

              {/* Step-by-Step Evidence Trail */}
              <div className="bg-detective-950 p-4 rounded-2xl border border-detective-800 space-y-3">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Validated Evidence Trail:</span>
                </span>
                <div className="space-y-2">
                  {finalReport.evidenceTrail.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-slate-300 font-mono bg-detective-900/60 p-2.5 rounded-xl border border-detective-800/60"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contradictions Breakdown */}
              <div className="bg-detective-950 p-4 rounded-2xl border border-detective-800 space-y-3">
                <span className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Critical Contradictions Exposed:</span>
                </span>
                <div className="space-y-2">
                  {finalReport.contradictionBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 font-mono bg-rose-950/10 border border-rose-500/20 p-2.5 rounded-xl flex items-start space-x-2"
                    >
                      <span className="text-rose-400 font-bold">•</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motive Analysis */}
              <div className="bg-detective-950 p-4 rounded-2xl border border-detective-800 space-y-1.5">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                  Motive & Opportunity Assessment:
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {finalReport.motiveBreakdown}
                </p>
              </div>

              {/* Actions: Copy & Re-investigate */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    // Reset to form
                    // generateReport has already saved, but user can re-indict
                    handleExecuteIndictment();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 border border-detective-800 hover:border-slate-700 flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-examine Dossier</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyReport}
                    className="px-4 py-2 rounded-xl bg-detective-800 hover:bg-detective-700 text-xs font-mono text-slate-200 flex items-center space-x-1.5 transition-colors border border-detective-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Dossier</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Dossier Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-detective-950 font-bold text-xs shadow-glow transition-all"
                  >
                    Finish Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

