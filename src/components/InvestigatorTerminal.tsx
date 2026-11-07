'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  FileText, 
  Clock, 
  ShieldAlert, 
  Gavel, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { ChatMessage } from '@/types/detective';

interface InvestigatorTerminalProps {
  onOpenReportModal: () => void;
}

export default function InvestigatorTerminal({ onOpenReportModal }: InvestigatorTerminalProps) {
  const { 
    activeCase, 
    chatMessages, 
    sendChatMessage, 
    isChatLoading, 
    setActiveDoc, 
    documents 
  } = useCase();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isChatLoading) return;
    const query = inputQuery;
    setInputQuery('');
    await sendChatMessage(query);
  };

  const handlePromptClick = (promptText: string) => {
    sendChatMessage(promptText);
  };

  const openDocByNumber = (docNum: string) => {
    const found = documents.find((d) => d.docNumber === docNum);
    if (found) {
      setActiveDoc(found);
    }
  };

  // Render markdown text with clickable [DOC-XX] citations
  const renderMessageContent = (content: string) => {
    const docRegex = /(\[DOC-\d+\])/g;
    const parts = content.split(docRegex);

    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((part, idx) => {
          if (docRegex.test(part)) {
            const cleanDocNum = part.replace(/[\[\]]/g, '');
            return (
              <button
                key={idx}
                onClick={() => openDocByNumber(cleanDocNum)}
                className="inline-flex items-center space-x-1 mx-1 px-1.5 py-0.5 rounded font-mono text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-400 hover:text-detective-950 transition-colors"
                title={`Open evidence file ${cleanDocNum}`}
              >
                <span>{part}</span>
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </button>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col p-4 sm:p-6 space-y-4">
      {/* Terminal Header */}
      <div className="bg-detective-900 border border-detective-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-detective-950 shadow-glow">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100">
                Sherlock AI • Forensic Investigator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Strict Evidence Grounding • Cross-Examines {documents.length} Case Exhibits
            </p>
          </div>
        </div>

        {/* Floating Accusation CTA */}
        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-slate-950 font-bold text-xs shadow-crimson transition-all flex items-center space-x-2"
        >
          <Gavel className="w-4 h-4" />
          <span>Formulate Final Indictment</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-detective-950/80 border border-detective-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-500 text-detective-950'
                    : 'bg-detective-800 border border-detective-700 text-amber-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 ${
                  isUser
                    ? 'bg-amber-500/10 border border-amber-500/30 text-slate-100'
                    : 'bg-detective-900 border border-detective-800 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-1 border-b border-detective-800/60">
                  <span className="font-bold uppercase tracking-wider text-slate-400">
                    {isUser ? 'Investigator' : 'Sherlock AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {renderMessageContent(msg.content)}

                {/* Citations List if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-detective-800/60">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Direct Citations:
                    </span>
                    {msg.citations.map((cite) => (
                      <button
                        key={cite}
                        onClick={() => openDocByNumber(cite)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-detective-950 border border-amber-500/30 text-amber-300 hover:border-amber-400"
                      >
                        {cite}
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested Followup Prompts */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((sp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(sp)}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-detective-950 hover:bg-detective-800 border border-detective-800 text-slate-300 hover:text-amber-300 transition-colors flex items-center space-x-1"
                      >
                        <span>{sp}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-detective-800 border border-detective-700 flex items-center justify-center text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-detective-900 border border-detective-800 rounded-2xl p-3.5 text-xs font-mono text-slate-400 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Cross-referencing evidence documents and telemetry logs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="bg-detective-900 border border-detective-800 rounded-2xl p-2.5 flex items-center space-x-2 shadow-xl"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask Sherlock AI about contradictions, suspect alibis, or timestamps in ${activeCase?.title}...`}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none pl-3 font-mono"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isChatLoading}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-detective-950 font-bold transition-all shadow-glow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

