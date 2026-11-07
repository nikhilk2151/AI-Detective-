'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Sparkles, 
  Tag, 
  MapPin, 
  Users, 
  Clock, 
  Activity, 
  Filter, 
  BadgeAlert,
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { EvidenceDoc, DocumentType } from '@/types/detective';

export default function EvidenceBrowser() {
  const { 
    documents, 
    activeDoc, 
    setActiveDoc, 
    extractDocEntities, 
    extractingDocId 
  } = useCase();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [highlightEntity, setHighlightEntity] = useState<string | null>(null);

  const filterTypes = [
    { id: 'all', label: 'All Files' },
    { id: 'witness_statement', label: 'Witness Statements' },
    { id: 'badge_swipe', label: 'Badge Logs' },
    { id: 'forensic_report', label: 'Forensic Reports' },
    { id: 'chat_log', label: 'Chat / Wiretaps' },
    { id: 'cctv_log', label: 'CCTV / Facilities' },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesType = selectedTypeFilter === 'all' || doc.type === selectedTypeFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.entityTags.people.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.entityTags.locations.some((l) => l.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const isExtracting = activeDoc ? extractingDocId === activeDoc.id : false;

  const handleExtract = () => {
    if (activeDoc) {
      extractDocEntities(activeDoc.id);
    }
  };

  const getDocTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'badge_swipe':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'forensic_report':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'witness_statement':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'chat_log':
        return 'text-violet-400 border-violet-500/30 bg-violet-500/10';
      case 'cctv_log':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-detective-950 border-r border-detective-800">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-detective-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Evidence Browser
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredDocs.length} / {documents.length} Exhibits
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, suspects, or dates..."
            className="w-full bg-detective-900 border border-detective-800 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 text-slate-100 placeholder-slate-500 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
          {filterTypes.map((ft) => (
            <button
              key={ft.id}
              onClick={() => setSelectedTypeFilter(ft.id)}
              className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                selectedTypeFilter === ft.id
                  ? 'bg-amber-500 text-detective-950 font-bold'
                  : 'bg-detective-900 text-slate-400 hover:text-slate-200 border border-detective-800'
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Doc List (top/middle) & Active Doc Viewer (bottom or expanded) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Document List */}
        <div className="max-h-[38%] overflow-y-auto divide-y divide-detective-850/60 p-2 space-y-1">
          {filteredDocs.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-detective-850 border-amber-500/50 shadow-sm'
                    : 'bg-detective-900/50 border-detective-800/80 hover:bg-detective-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold bg-detective-950 px-1.5 py-0.5 rounded text-amber-400 border border-detective-700">
                    {doc.docNumber}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${getDocTypeColor(doc.type)}`}>
                    {doc.type.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">
                  {doc.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[140px]">{doc.source}</span>
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    <span>
                      {doc.entityTags.people.length + doc.entityTags.locations.length} tags
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Document Full Reader */}
        {activeDoc ? (
          <div className="flex-1 flex flex-col border-t-2 border-detective-800 bg-detective-900/40 min-h-0 overflow-hidden">
            {/* Active Doc Control Bar */}
            <div className="p-3 bg-detective-900/90 border-b border-detective-800 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {activeDoc.docNumber}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100 truncate max-w-[200px]">
                    {activeDoc.title}
                  </h4>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {activeDoc.dateOrTime} • {activeDoc.source}
                </div>
              </div>

              {/* Gemini Extraction Button */}
              <button
                onClick={handleExtract}
                disabled={isExtracting}
                title="Extract People, Locations, and Contradictions with Gemini"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-detective-950 font-bold text-xs shadow-glow transition-all"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Gemini Extract</span>
                  </>
                )}
              </button>
            </div>

            {/* Entity Tags Bar */}
            <div className="p-3 bg-detective-950/80 border-b border-detective-800/80 space-y-2 text-[11px] font-mono max-h-36 overflow-y-auto">
              <div className="flex items-center space-x-1 text-slate-400 font-bold uppercase text-[10px]">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Extracted Entities (Gemini Structured Schema):</span>
              </div>

              {/* People */}
              {activeDoc.entityTags.people.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[10px] flex items-center space-x-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>People:</span>
                  </span>
                  {activeDoc.entityTags.people.map((p) => (
                    <span
                      key={p}
                      onClick={() => setHighlightEntity(highlightEntity === p ? null : p)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                        highlightEntity === p
                          ? 'bg-amber-400 text-detective-950 font-bold border-amber-300'
                          : 'bg-detective-900 text-amber-300 border-amber-500/30 hover:border-amber-400'
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Locations */}
              {activeDoc.entityTags.locations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[10px] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Locations:</span>
                  </span>
                  {activeDoc.entityTags.locations.map((loc) => (
                    <span
                      key={loc}
                      onClick={() => setHighlightEntity(highlightEntity === loc ? null : loc)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                        highlightEntity === loc
                          ? 'bg-cyan-400 text-detective-950 font-bold border-cyan-300'
                          : 'bg-detective-900 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
                      }`}
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              )}

              {/* Timestamps */}
              {activeDoc.entityTags.timestamps.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[10px] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Times:</span>
                  </span>
                  {activeDoc.entityTags.timestamps.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-detective-900 text-emerald-300 border border-emerald-500/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Document Content Box */}
            <div className="flex-1 p-4 overflow-y-auto bg-detective-950 font-mono text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap select-text">
              {activeDoc.content}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 text-xs font-mono text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-700" />
            <p>Select an evidentiary document from the catalog above to inspect.</p>
          </div>
        )}
      </div>
    </div>
  );
}

