'use client';

import React from 'react';
import { 
  X, 
  Search, 
  Bot, 
  Gavel, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  onStartSolving: () => void;
}

export default function HowItWorksModal({ onClose, onStartSolving }: HowItWorksModalProps) {
  const steps = [
    {
      num: '01',
      title: 'Review the Evidence & Statements',
      desc: 'Browse eyewitness notes, building access records, and camera logs. Red tags highlight where a suspect’s story clashes with physical facts.',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Step 1: Discover',
    },
    {
      num: '02',
      title: 'Interrogate with Myri AI',
      desc: 'Use the AI Detective chat below. Ask questions like "Who is lying?", "Check Maya\'s alibi", or click one of the quick prompt suggestions to expose holes in their story.',
      icon: Bot,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Step 2: Investigate',
    },
    {
      num: '03',
      title: 'Accuse the Culprit & Get Verdict',
      desc: 'When you know who did it, hit "Accuse & Solve Case" on that suspect. Myri AI analyzes the entire evidence trail and delivers an instant Guilty or Innocent verdict with proof!',
      icon: Gavel,
      color: 'from-crime-red to-orange-500',
      badge: 'Step 3: Solve',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-dark-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 relative text-white space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ai-blue to-crime-red flex items-center justify-center text-white shadow-blue-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              How to Solve a Mystery with Myri AI
            </h2>
            <p className="text-xs text-slate-400">
              3 simple steps to crack any fictional crime in under 2 minutes
            </p>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 gap-3.5">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-dark-950/80 border border-white/5 rounded-2xl p-4 flex items-start space-x-4 hover:border-ai-blue/30 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-extrabold shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ai-cyan bg-ai-blue/10 px-2 py-0.5 rounded border border-ai-blue/20">
                      {s.badge}
                    </span>
                    <h4 className="text-sm font-bold text-white">{s.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Humanized Tips Box */}
        <div className="p-3.5 rounded-2xl bg-dark-950 border border-crime-red/20 flex items-start space-x-3 text-xs text-slate-300">
          <AlertTriangle className="w-4 h-4 text-crime-lightred shrink-0 mt-0.5" />
          <div>
            <strong className="text-crime-lightred font-bold">Detective Pro-Tip:</strong> Pay special attention to timestamps! If a suspect claims they were at dinner at 9:55 PM, check whether their keycard or local Wi-Fi was recorded elsewhere at that exact moment.
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onStartSolving();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ai-blue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white font-bold text-xs sm:text-sm shadow-blue-glow transition-all flex items-center space-x-2"
          >
            <span>Start Solving Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

