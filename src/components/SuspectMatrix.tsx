'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Crosshair, 
  Sliders, 
  Gavel, 
  FileCheck2, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { Suspect, SuspectStatus, ClaimType } from '@/types/detective';

interface SuspectMatrixProps {
  onAccuseSuspect: (suspect: Suspect) => void;
}

export default function SuspectMatrix({ onAccuseSuspect }: SuspectMatrixProps) {
  const { suspects, updateSuspectBlame, updateSuspectStatus } = useCase();
  const [expandedSuspectId, setExpandedSuspectId] = useState<string | null>(suspects[0]?.id || null);

  const getStatusBadge = (status: SuspectStatus) => {
    switch (status) {
      case 'prime_suspect':
        return (
          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            Prime Suspect
          </span>
        );
      case 'person_of_interest':
        return (
          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
            Person of Interest
          </span>
        );
      case 'cleared':
        return (
          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Cleared Alibi
          </span>
        );
    }
  };

  const getClaimBadge = (type: ClaimType) => {
    switch (type) {
      case 'fact':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'assumption':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'speculation':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-detective-950">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-detective-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Suspect Matrix
            </h3>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Motive • Opportunity • Alibi Solidness
          </p>
        </div>

        <span className="text-[10px] font-mono text-slate-500 bg-detective-900 border border-detective-800 px-2 py-1 rounded">
          {suspects.length} Persons of Interest
        </span>
      </div>

      {/* Suspects Scroll List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3.5">
        {suspects.map((suspect) => {
          const isExpanded = expandedSuspectId === suspect.id;

          return (
            <div
              key={suspect.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                suspect.status === 'prime_suspect'
                  ? 'bg-detective-900/90 border-rose-500/40 shadow-crimson'
                  : 'bg-detective-900/60 border-detective-800 hover:border-slate-700'
              }`}
            >
              {/* Card Summary Header */}
              <div
                onClick={() => setExpandedSuspectId(isExpanded ? null : suspect.id)}
                className="p-3.5 cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={suspect.avatar}
                    alt={suspect.name}
                    className="w-11 h-11 rounded-xl object-cover border border-detective-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-100 truncate">
                        {suspect.name}
                      </h4>
                      {getStatusBadge(suspect.status)}
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {suspect.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 block">Blame</span>
                    <span className="text-xs font-mono font-extrabold text-amber-400">
                      {suspect.blameConfidence}%
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Dossier & Interactive Meters */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-detective-800/80 space-y-4 text-xs font-mono">
                  {/* Status Dropdown Picker */}
                  <div className="flex items-center justify-between bg-detective-950 p-2 rounded-xl border border-detective-800">
                    <span className="text-[10px] text-slate-400 uppercase">Clearance Status:</span>
                    <select
                      value={suspect.status}
                      onChange={(e) => updateSuspectStatus(suspect.id, e.target.value as SuspectStatus)}
                      className="bg-detective-900 border border-detective-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="person_of_interest">Person of Interest</option>
                      <option value="prime_suspect">Prime Suspect (High Blame)</option>
                      <option value="cleared">Cleared of Suspicion</option>
                    </select>
                  </div>

                  {/* Interactive Motive, Opportunity, Alibi Meters */}
                  <div className="space-y-2 bg-detective-950/80 p-3 rounded-xl border border-detective-800/80">
                    {/* Motive */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 uppercase">Motive Likelihood:</span>
                        <span className="text-amber-400 font-bold">{suspect.motiveScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-detective-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${suspect.motiveScore}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans mt-1 leading-tight">
                        {suspect.motive}
                      </p>
                    </div>

                    {/* Opportunity */}
                    <div className="pt-2 border-t border-detective-800/50">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 uppercase">Physical Opportunity:</span>
                        <span className="text-cyan-400 font-bold">{suspect.opportunityScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-detective-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all"
                          style={{ width: `${suspect.opportunityScore}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans mt-1 leading-tight">
                        {suspect.opportunity}
                      </p>
                    </div>

                    {/* Alibi Solidness */}
                    <div className="pt-2 border-t border-detective-800/50">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400 uppercase">Alibi Credibility:</span>
                        <span className={`${suspect.alibiSolidness > 50 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
                          {suspect.alibiSolidness}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-detective-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            suspect.alibiSolidness > 50 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${suspect.alibiSolidness}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans mt-1 leading-tight">
                        "{suspect.alibi}"
                      </p>
                    </div>
                  </div>

                  {/* Accusation Confidence Slider */}
                  <div className="bg-detective-950 p-3 rounded-xl border border-detective-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 uppercase flex items-center space-x-1">
                        <Sliders className="w-3 h-3 text-amber-400" />
                        <span>Investigator Accusation Weight:</span>
                      </span>
                      <span className="text-amber-400 font-extrabold text-xs">
                        {suspect.blameConfidence}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={suspect.blameConfidence}
                      onChange={(e) => updateSuspectBlame(suspect.id, parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-detective-800 rounded-lg"
                    />

                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>0% (Innocent)</span>
                      <span>50% (Under Review)</span>
                      <span>100% (Guilty)</span>
                    </div>
                  </div>

                  {/* Suspect Claims Categorization */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">
                      Claim Credibility Tracker:
                    </span>
                    {suspect.claims.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2 rounded-lg border text-[11px] leading-tight space-y-1 ${
                          c.isContradicted
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                            : 'bg-detective-950 border-detective-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-bold ${getClaimBadge(c.type)}`}>
                            {c.type}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            Ref: {c.sourceDocNumber || 'Interview'} • Conf: {c.confidence}%
                          </span>
                        </div>
                        <p className="font-sans text-[11px]">{c.claim}</p>
                        {c.isContradicted && (
                          <div className="flex items-center space-x-1 text-[9px] text-rose-400 font-bold uppercase">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Contradicted by Physical Evidence</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Indictment Button */}
                  <button
                    onClick={() => onAccuseSuspect(suspect)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-slate-950 font-bold text-xs shadow-crimson transition-all flex items-center justify-center space-x-2"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Indict & Generate Case Report</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

