'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Gavel, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  Copy, 
  RotateCcw,
  Loader2,
  ArrowRight,
  FileText,
  Download,
  Database
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { Suspect, FinalReport } from '@/types/detective';

interface AiVerdictModalProps {
  preselectedSuspect?: Suspect | null;
  onClose: () => void;
}

export default function AiVerdictModal({ preselectedSuspect, onClose }: AiVerdictModalProps) {
  const { 
    activeCase, 
    suspects, 
    generateReport, 
    isGeneratingReport, 
    finalReport,
    closeReportModal 
  } = useCase();

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(
    preselectedSuspect?.id || suspects[0]?.id || ''
  );
  const [userReasoning, setUserReasoning] = useState('');
  const [copied, setCopied] = useState(false);
  const [reportViewTab, setReportViewTab] = useState<'visual' | 'text'>('visual');

  // Trigger celebration confetti on SOLVED verdict
  useEffect(() => {
    if (finalReport && finalReport.verdict === 'SOLVED') {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#3b82f6', '#ef4444', '#10b981', '#ffffff'],
      });
    }
  }, [finalReport]);

  const handleIndict = async () => {
    if (!selectedSuspectId) return;
    await generateReport(selectedSuspectId, userReasoning);
  };

  const handleCopy = () => {
    if (!finalReport) return;
    const textToCopy = finalReport.fullReportText || `MYRI AI FORENSIC CASE STUDY REPORT:
Case: ${activeCase?.title}
Accused: ${finalReport.accusedSuspectName}
Verdict: ${finalReport.verdict}
Accuracy Score: ${finalReport.accuracyScore}%
Summary: ${finalReport.executiveSummary}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!finalReport) return;
    const textToDownload = finalReport.fullReportText || `MYRI AI REPORT - ${activeCase?.title}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaseReport_${finalReport.caseId}_${finalReport.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const accused = suspects.find((s) => s.id === selectedSuspectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-dark-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="p-5 bg-dark-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ai-blue to-crime-red flex items-center justify-center text-white shadow-blue-glow">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Myri AI • Case Solver & Verdict
              </h3>
              <p className="text-xs text-slate-400">
                {activeCase?.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              closeReportModal();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!finalReport ? (
            /* PHASE 1: Accusation Selector */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  1. Choose the Culprit:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suspects.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSuspectId(s.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                        selectedSuspectId === s.id
                          ? 'bg-ai-blue/15 border-ai-blue shadow-blue-glow ring-1 ring-ai-blue'
                          : 'bg-dark-950/70 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{s.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accused Alibi Preview */}
              {accused && (
                <div className="p-3.5 bg-dark-950 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Suspect's Sworn Alibi:
                  </div>
                  <p className="italic text-slate-200 font-sans">
                    "{accused.alibi}"
                  </p>
                </div>
              )}

              {/* Optional User Reasoning */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  2. Why do you suspect them? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={userReasoning}
                  onChange={(e) => setUserReasoning(e.target.value)}
                  placeholder="e.g. Their badge was swiped at the scene right when they claimed they were out at dinner..."
                  className="w-full bg-dark-950 border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                />
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleIndict}
                disabled={isGeneratingReport || !selectedSuspectId}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-ai-blue via-ai-darkblue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white font-extrabold text-sm shadow-blue-glow hover:shadow-red-glow transition-all flex items-center justify-center space-x-2"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Myri AI Analyzing Evidence...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Confirm Accusation & Reveal Verdict</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* PHASE 2: Official Verdict Display */
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Report Tab Selector & Firestore Status Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReportViewTab('visual')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      reportViewTab === 'visual'
                        ? 'bg-ai-blue text-white shadow-md'
                        : 'text-slate-400 hover:text-white bg-dark-950'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Visual Dossier</span>
                  </button>

                  <button
                    onClick={() => setReportViewTab('text')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      reportViewTab === 'text'
                        ? 'bg-ai-blue text-white shadow-md'
                        : 'text-slate-400 hover:text-white bg-dark-950'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Firestore Text Report</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Stored in Firestore (Text Format)</span>
                </div>
              </div>

              {reportViewTab === 'visual' ? (
                /* Visual Report View */
                <div className="space-y-4">
                  {/* Verdict Banner */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
                      finalReport.verdict === 'SOLVED'
                        ? 'bg-gradient-to-r from-ai-blue/20 via-emerald-950/30 to-ai-darkblue/20 border-ai-blue shadow-blue-glow'
                        : 'bg-gradient-to-r from-crime-red/20 to-dark-950 border-crime-red shadow-red-glow'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 ${
                          finalReport.verdict === 'SOLVED'
                            ? 'bg-gradient-to-tr from-ai-blue to-emerald-500'
                            : 'bg-crime-red'
                        }`}
                      >
                        {finalReport.verdict === 'SOLVED' ? (
                          <ShieldCheck className="w-7 h-7" />
                        ) : (
                          <AlertTriangle className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-white">
                          {finalReport.verdict === 'SOLVED' ? 'CASE SOLVED!' : 'WRONG SUSPECT!'}
                        </h3>
                        <p className="text-xs text-slate-300">
                          Accused: <strong>{finalReport.accusedSuspectName}</strong> • Score: <strong>{finalReport.accuracyScore}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-dark-950/80 border border-white/10 text-xs font-mono text-ai-cyan font-bold">
                      {finalReport.aiDetectiveGrade}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-dark-950 rounded-2xl border border-white/5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-ai-cyan block tracking-wider">
                      Official Verdict Explanation:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      {finalReport.executiveSummary}
                    </p>
                  </div>

                  {/* Concrete Proof Points */}
                  <div className="p-4 bg-dark-950 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-white block tracking-wider">
                      Concrete Evidence Trail:
                    </span>
                    <div className="space-y-1.5">
                      {finalReport.evidenceTrail.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-xs text-slate-300 font-sans"
                        >
                          <span className="text-ai-cyan font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Monospaced Pure Text Report View */
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Text Document Representation (100% Text Data)</span>
                    <span className="font-mono text-[11px] text-ai-cyan">Encoding: UTF-8 / text/plain</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-black/80 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap select-all">
                    {finalReport.fullReportText}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => closeReportModal()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-dark-800 hover:bg-dark-700 flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Another Suspect</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadTxt}
                    className="px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs text-white font-medium flex items-center space-x-1.5 border border-white/5"
                    title="Download complete text report as .txt"
                  >
                    <Download className="w-3.5 h-3.5 text-ai-cyan" />
                    <span>Download .txt</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs text-white font-medium flex items-center space-x-1.5 border border-white/5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Full Text' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={() => {
                      closeReportModal();
                      onClose();
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-ai-blue to-crime-red text-white text-xs font-bold shadow-md hover:opacity-90"
                  >
                    Done
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

