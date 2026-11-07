'use client';

import React from 'react';
import { 
  Users, 
  Gavel, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Clock,
  Compass
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { Suspect } from '@/types/detective';

interface SuspectLineupProps {
  onAccuse: (suspect: Suspect) => void;
}

export default function SuspectLineup({ onAccuse }: SuspectLineupProps) {
  const { suspects, contradictions } = useCase();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-ai-blue/10 border border-ai-blue/30 flex items-center justify-center text-ai-cyan">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              The Suspect Lineup & Timestamps
            </h3>
            <p className="text-xs text-slate-400">
              Cross-examine check-in/out logs, motives, and alibis
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-ai-cyan bg-ai-blue/10 border border-ai-blue/20 px-2.5 py-1 rounded-full">
          {suspects.length} Suspects
        </span>
      </div>

      {/* Grid of Suspect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suspects.map((suspect) => {
          // Check if this suspect has contradictions
          const hasContradiction = contradictions.some(
            (c) => c.suspectId === suspect.id || suspect.claims.some((cl) => cl.isContradicted)
          );

          return (
            <div
              key={suspect.id}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group ${
                hasContradiction
                  ? 'bg-dark-900 border-crime-red/40 hover:border-crime-red shadow-sm hover:shadow-red-glow'
                  : 'bg-dark-900/80 border-white/10 hover:border-ai-blue/50 hover:shadow-blue-glow'
              }`}
            >
              {/* Image & Header */}
              <div className="relative h-44 overflow-hidden bg-dark-950">
                <img
                  src={suspect.avatar}
                  alt={suspect.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                {/* Contradiction alert badge */}
                {hasContradiction && (
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-crime-red/90 text-white shadow-md animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Lying / Disputed</span>
                  </div>
                )}

                {/* Name & Role overlay */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h4 className="text-sm font-extrabold text-white leading-tight drop-shadow">
                    {suspect.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-300 drop-shadow">
                    {suspect.role}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Claimed Alibi */}
                <div className="bg-dark-950/70 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Claimed Alibi:
                  </span>
                  <p className="text-xs text-slate-200 italic line-clamp-2 leading-relaxed">
                    "{suspect.alibi}"
                  </p>
                </div>

                {/* Check-in & Check-out Times */}
                <div className="bg-dark-950/80 px-2.5 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3 h-3 text-ai-cyan" />
                    <span>In: <strong className="text-white">{suspect.checkInTime || '09:00 PM'}</strong></span>
                  </span>
                  <span>
                    Out: <strong className="text-white">{suspect.checkOutTime || '11:15 PM'}</strong>
                  </span>
                </div>

                {/* Motive & Opportunity */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="text-[11px] line-clamp-2">
                    <strong className="text-amber-400 font-bold">Motive: </strong>
                    {suspect.motive}
                  </div>
                  {suspect.guidelines && (
                    <div className="text-[10px] text-slate-400 italic line-clamp-2">
                      <strong className="text-ai-cyan font-bold not-italic">Note: </strong>
                      {suspect.guidelines}
                    </div>
                  )}
                </div>

                {/* Accuse & Solve Button */}
                <button
                  onClick={() => onAccuse(suspect)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-ai-blue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Accuse This Suspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
