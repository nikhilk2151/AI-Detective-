'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Sparkles, 
  ExternalLink, 
  AlertOctagon, 
  Tag, 
  Clock, 
  Eye, 
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { EvidenceDoc } from '@/types/detective';

export default function EvidenceCluesList() {
  const { documents, extractDocEntities, extractingDocId } = useCase();
  const [selectedDoc, setSelectedDoc] = useState<EvidenceDoc | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.docNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-crime-red/10 border border-crime-red/30 flex items-center justify-center text-crime-lightred">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Case Evidence & Exhibits
            </h3>
            <p className="text-xs text-slate-400">
              Cross-examine documents to catch suspect lies
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clues or names..."
            className="w-full bg-dark-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
          />
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="p-4 rounded-2xl bg-dark-900/90 border border-white/10 hover:border-ai-blue/40 hover:bg-dark-850 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-extrabold bg-dark-950 px-2 py-0.5 rounded text-ai-cyan border border-white/10">
                  {doc.docNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {doc.dateOrTime}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-ai-lightblue transition-colors line-clamp-1">
                {doc.title}
              </h4>

              <p className="text-xs text-slate-300 font-sans line-clamp-3 leading-relaxed mt-1.5">
                {doc.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="truncate max-w-[150px]">{doc.source}</span>
              <span className="flex items-center space-x-1 text-ai-cyan group-hover:underline">
                <span>View Full File</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Document Reader Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-dark-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative text-white space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ai-blue/15 text-ai-cyan border border-ai-blue/30">
                    {selectedDoc.docNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedDoc.dateOrTime}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-400">{selectedDoc.source}</p>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Extracted Entities Tag Chips */}
            {selectedDoc.entityTags.people.length > 0 && (
              <div className="p-3 bg-dark-950 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Key Entities Mentioned:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.entityTags.people.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded text-[11px] bg-ai-blue/15 text-ai-lightblue border border-ai-blue/30">
                      👤 {p}
                    </span>
                  ))}
                  {selectedDoc.entityTags.locations.map((loc) => (
                    <span key={loc} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      📍 {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content Text */}
            <div className="p-4 bg-dark-950 rounded-2xl border border-white/5 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
              {selectedDoc.content}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => extractDocEntities(selectedDoc.id)}
                disabled={extractingDocId === selectedDoc.id}
                className="px-4 py-2 rounded-xl bg-ai-blue/20 hover:bg-ai-blue/30 border border-ai-blue/40 text-ai-cyan text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                {extractingDocId === selectedDoc.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Entities...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze with Gemini</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-white"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

