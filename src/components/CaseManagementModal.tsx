'use client';

import React, { useState } from 'react';
import { 
  X, 
  FolderKanban, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  Search,
  Sparkles,
  Download,
  Copy,
  Check,
  Database
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { MysteryCase, FinalReport } from '@/types/detective';

interface CaseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddNewCase: () => void;
}

export default function CaseManagementModal({
  isOpen,
  onClose,
  onOpenAddNewCase,
}: CaseManagementModalProps) {
  const { cases, activeCase, selectCase, deleteCustomCase, solvedCases, savedReports } = useCase();
  const [activeTab, setActiveTab] = useState<'cases' | 'reports'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyReport = (rep: FinalReport) => {
    navigator.clipboard.writeText(rep.fullReportText || rep.executiveSummary);
    setCopiedId(rep.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReport = (rep: FinalReport) => {
    const textToDownload = rep.fullReportText || `MYRI AI REPORT - ${rep.caseTitle || rep.caseId}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaseReport_${rep.caseId}_${rep.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCustomCase = (c: MysteryCase) => {
    return !['case-1', 'case-2', 'case-3'].includes(c.id);
  };

  const handleDelete = async (caseId: string) => {
    if (confirm('Are you sure you want to delete this custom case dossier? This action cannot be undone.')) {
      setDeletingId(caseId);
      try {
        await deleteCustomCase(caseId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const solvedCount = Object.values(solvedCases).filter(Boolean).length;
  const customCount = cases.filter(isCustomCase).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0d0f14] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Case Management Hub
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                  {cases.length} Dossiers
                </span>
              </div>
              <p className="text-xs text-white/50">
                Switch between mystery archives, monitor reports in Firestore, or create custom files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddNewCase();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-white/10 bg-black/40 gap-4">
          <button
            onClick={() => setActiveTab('cases')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'cases'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Mystery Dossiers ({cases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Firestore Text Reports ({savedReports.length})</span>
            {savedReports.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* Stats & Search Bar */}
        <div className="p-4 border-b border-white/10 bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Total: <strong className="text-white">{cases.length}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Solved: <strong className="text-white">{solvedCount}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Custom: <strong className="text-white">{customCount}</strong></span>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter cases by title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'cases' ? (
          /* Cases Grid */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 text-white/40 space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">No cases match your search query.</p>
              </div>
            ) : (
              filteredCases.map((c) => {
                const isActive = activeCase?.id === c.id;
                const isSolved = Boolean(solvedCases[c.id]);
                const custom = isCustomCase(c);

                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-blue-950/20 border-blue-500/40 shadow-lg shadow-blue-500/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">
                          {c.title}
                        </h3>
                        {custom ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Custom Case
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Pre-loaded Archive
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10 uppercase">
                          {c.difficulty}
                        </span>
                        {isSolved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SOLVED</span>
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white shadow-sm">
                            CURRENTLY INVESTIGATING
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {c.summary || c.subtitle}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-white/40 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Window: {c.timeOfCrime}</span>
                        </span>
                        {c.crimeScene && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>Scene: {c.crimeScene}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {custom && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
                          title="Delete this custom case"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {isActive ? (
                        <button
                          onClick={onClose}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/20 transition-all flex items-center gap-1.5"
                        >
                          <span>Resume Investigation</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            selectCase(c.id);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                        >
                          <span>Switch to Case</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Stored Case Reports in Firestore (Text Format) */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedReports.length === 0 ? (
              <div className="text-center py-16 text-white/40 space-y-3">
                <FileText className="w-10 h-10 mx-auto opacity-40 text-blue-400" />
                <h4 className="text-sm font-bold text-white">No Case Study Reports Filed Yet</h4>
                <p className="text-xs max-w-md mx-auto text-white/50">
                  Select any suspect in an active mystery, click "Accuse Culprit & Solve Case", and Myri AI will automatically generate and store the complete case study report in Firebase Firestore in 100% text format.
                </p>
              </div>
            ) : (
              savedReports.map((rep) => {
                const isExpanded = expandedReportId === rep.id;
                const isSolved = rep.verdict === 'SOLVED';

                return (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">
                            {rep.caseTitle || rep.caseId}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isSolved
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {rep.verdict}
                          </span>
                          <span className="text-[10px] font-mono text-ai-cyan bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                            Score: {rep.accuracyScore}%
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <Database className="w-2.5 h-2.5" />
                            <span>Firestore Text</span>
                          </span>
                        </div>
                        <p className="text-xs text-white/60">
                          Accused Suspect: <strong className="text-white">{rep.accusedSuspectName}</strong> • Filed: {new Date(rep.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDownloadReport(rep)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
                          title="Download report as .txt"
                        >
                          <Download className="w-3 h-3 text-ai-cyan" />
                          <span>.txt</span>
                        </button>

                        <button
                          onClick={() => handleCopyReport(rep)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
                        >
                          {copiedId === rep.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === rep.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => setExpandedReportId(isExpanded ? null : rep.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-semibold text-white shadow-md transition-all flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{isExpanded ? 'Hide Text' : 'View Text Report'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Pure Text Report Representation */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-white/10 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] text-white/40">
                          <span>Firestore Stored Payload (Format: text/plain)</span>
                          <span className="font-mono">ID: {rep.id}</span>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-black/90 border border-white/10 text-emerald-400 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto select-all">
                          {rep.fullReportText || rep.executiveSummary}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <p className="text-xs text-white/40">
            All data persists automatically in Firestore free-tier and browser local cache.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
}

