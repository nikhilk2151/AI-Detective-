'use client';

import React, { useState } from 'react';
import { 
  GitCommit, 
  AlertOctagon, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  HelpCircle,
  FileText,
  Sparkles,
  ChevronRight,
  SplitSquareVertical
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { TimelineNode, Contradiction } from '@/types/detective';

export default function TimelineContradictionBoard() {
  const { 
    timelines, 
    contradictions, 
    toggleContradictionResolved, 
    setActiveDoc, 
    documents 
  } = useCase();

  const [activeTab, setActiveTab] = useState<'both' | 'timeline' | 'contradictions'>('both');

  const openDocByNumber = (docNum: string) => {
    const found = documents.find((d) => d.docNumber === docNum);
    if (found) {
      setActiveDoc(found);
    }
  };

  const getSeverityStyle = (severity: Contradiction['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-crimson',
          border: 'border-rose-500/50 bg-rose-950/10',
          dot: 'bg-rose-500',
        };
      case 'high':
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-glow',
          border: 'border-amber-500/50 bg-amber-950/10',
          dot: 'bg-amber-500',
        };
      case 'moderate':
        return {
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
          border: 'border-yellow-500/40 bg-yellow-950/10',
          dot: 'bg-yellow-500',
        };
    }
  };

  const unresolvedContradictions = contradictions.filter((c) => !c.resolved);

  return (
    <div className="flex flex-col h-full bg-detective-950 border-r border-detective-800">
      {/* Panel Top Navigation */}
      <div className="p-4 border-b border-detective-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Timeline & Contradiction Board
            </h3>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            {timelines.length} Chronological Nodes • {unresolvedContradictions.length} Active Clashes
          </p>
        </div>

        {/* View Segmented Switcher */}
        <div className="flex items-center bg-detective-900 border border-detective-800 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'both'
                ? 'bg-amber-500 text-detective-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'timeline'
                ? 'bg-amber-500 text-detective-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timeline ({timelines.length})
          </button>
          <button
            onClick={() => setActiveTab('contradictions')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'contradictions'
                ? 'bg-amber-500 text-detective-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clashes ({unresolvedContradictions.length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* SECTION 1: Chronological Timeline */}
        {(activeTab === 'both' || activeTab === 'timeline') && (
          <div
            className={`flex flex-col border-r border-detective-800/80 min-h-0 overflow-hidden ${
              activeTab === 'both' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="p-3 bg-detective-900/60 border-b border-detective-800 flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center space-x-1.5">
                <GitCommit className="w-3.5 h-3.5" />
                <span>Chronological Event Trail</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Sorted Earliest to Latest
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-amber-500 before:to-rose-500">
                {timelines.map((node) => (
                  <div key={node.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-detective-950 transition-all ${
                        node.isKeyEvidence
                          ? 'bg-amber-400 ring-2 ring-amber-400/40 animate-pulse'
                          : node.verified
                          ? 'bg-cyan-400'
                          : 'bg-slate-600'
                      }`}
                    />

                    {/* Timeline Card */}
                    <div className="bg-detective-900/80 border border-detective-800 rounded-xl p-3 space-y-2 hover:border-slate-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                          {node.displayTime}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {node.isKeyEvidence && (
                            <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                              Key Clue
                            </span>
                          )}

                          <button
                            onClick={() => openDocByNumber(node.sourceDocNumber)}
                            className="text-[10px] font-mono text-slate-400 hover:text-amber-400 flex items-center space-x-1 bg-detective-950 px-1.5 py-0.5 rounded border border-detective-800"
                          >
                            <span>{node.sourceDocNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100">{node.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                        {node.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-detective-800/60 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center space-x-1 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{node.location}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-slate-500">
                          {node.entitiesInvolved.slice(0, 2).map((e) => (
                            <span key={e} className="truncate max-w-[80px]">
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Contradiction Alert Feed */}
        {(activeTab === 'both' || activeTab === 'contradictions') && (
          <div
            className={`flex flex-col min-h-0 overflow-hidden ${
              activeTab === 'both' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="p-3 bg-detective-900/60 border-b border-detective-800 flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Contradiction Radar</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Alibi Discrepancies
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {contradictions.map((c) => {
                const style = getSeverityStyle(c.severity);
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
                      c.resolved
                        ? 'bg-detective-950/40 border-detective-800 opacity-60'
                        : `${style.border} shadow-sm`
                    }`}
                  >
                    {/* Header: Severity & Clash Docs */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <span
                          className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${style.badge}`}
                        >
                          {c.severity} Severity
                        </span>
                      </div>

                      {/* Source Comparison Badges */}
                      <div className="flex items-center space-x-1 text-[10px] font-mono">
                        <button
                          onClick={() => openDocByNumber(c.docANumber)}
                          className="bg-detective-900 hover:bg-detective-800 px-1.5 py-0.5 rounded text-amber-400 border border-detective-700 font-bold"
                        >
                          {c.docANumber}
                        </button>
                        <span className="text-rose-400 font-extrabold">VS</span>
                        <button
                          onClick={() => openDocByNumber(c.docBNumber)}
                          className="bg-detective-900 hover:bg-detective-800 px-1.5 py-0.5 rounded text-cyan-400 border border-detective-700 font-bold"
                        >
                          {c.docBNumber}
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-xs font-bold text-slate-100">{c.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                      {c.description}
                    </p>

                    {/* Gemini AI Reasoning Box */}
                    <div className="bg-detective-950/80 border border-detective-800/80 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-amber-400 font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>Gemini Reasoning Breakdown:</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        {c.aiReasoning}
                      </p>
                    </div>

                    {/* Footer: Resolved Toggle */}
                    <div className="flex items-center justify-between pt-1 border-t border-detective-800/60">
                      <span className="text-[10px] font-mono text-slate-500">
                        {c.resolved ? 'Status: Resolved' : 'Status: Unresolved Clash'}
                      </span>
                      <button
                        onClick={() => toggleContradictionResolved(c.id)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center space-x-1 ${
                          c.resolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-detective-900 text-slate-400 border-detective-700 hover:text-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{c.resolved ? 'Resolved' : 'Mark as Solved'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

