'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FolderPlus, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Target, 
  FileText, 
  Users, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';
import { MysteryCase, EvidenceDoc, Suspect, Difficulty } from '@/types/detective';

interface AddNewCaseModalProps {
  onClose: () => void;
}

interface SuspectInput {
  name: string;
  role: string;
  motive: string;
  alibi: string;
  checkInTime: string;
  checkOutTime: string;
  guidelines: string;
  isCulprit: boolean;
  guiltExplanation: string;
}

interface EvidenceInput {
  docNumber: string;
  title: string;
  type: string;
  source: string;
  content: string;
}

export default function AddNewCaseModal({ onClose }: AddNewCaseModalProps) {
  const { addNewCase } = useCase();

  // Step 1: Case Details
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [crimeScene, setCrimeScene] = useState('');
  const [timeOfCrime, setTimeOfCrime] = useState('');
  const [victimOrTarget, setVictimOrTarget] = useState('');
  const [summary, setSummary] = useState('');

  // Step 2: Suspects List
  const [suspectsList, setSuspectsList] = useState<SuspectInput[]>([
    {
      name: 'Arthur Pendelton',
      role: 'Private Butler',
      motive: 'Large personal gambling debt due this week.',
      alibi: 'Claims he was in the kitchen polishing silver between 10:00 PM and 11:30 PM.',
      checkInTime: '10:05 PM',
      checkOutTime: '11:25 PM',
      guidelines: 'Inquire about silver polish smells and kitchen log timestamps.',
      isCulprit: true,
      guiltExplanation: 'Silver polishing was completed at 10:15 PM according to kitchen logs, leaving a 45-minute window.',
    },
    {
      name: 'Clara Oswald',
      role: 'Executive Guest',
      motive: 'Fierce social rival of the victim.',
      alibi: 'Attending the open bar in the central ballroom surrounded by guests.',
      checkInTime: '09:30 PM',
      checkOutTime: '12:00 AM',
      guidelines: 'Verified by multiple patrons and photos.',
      isCulprit: false,
      guiltExplanation: 'Ballroom photobooth timestamps confirm continuous presence.',
    },
  ]);

  // Step 3: Evidence Documents List
  const [evidenceList, setEvidenceList] = useState<EvidenceInput[]>([
    {
      docNumber: 'DOC-01',
      title: 'Facility Keycard & Access Log',
      type: 'badge_swipe',
      source: 'Central Electronic Lock Log',
      content: '10:05 PM - Arthur Pendelton swiped into Main Hallway.\n10:48 PM - Suite 501 Master Key used.\n11:25 PM - Arthur Pendelton swiped exit.',
    },
    {
      docNumber: 'DOC-02',
      title: 'Kitchen Staff Testimony',
      type: 'witness_statement',
      source: 'Head Chef Interview',
      content: 'The head chef stated Arthur left the kitchen pantry around 10:20 PM and was not seen again until 11:15 PM.',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSuspect = () => {
    setSuspectsList((prev) => [
      ...prev,
      {
        name: '',
        role: '',
        motive: '',
        alibi: '',
        checkInTime: '',
        checkOutTime: '',
        guidelines: '',
        isCulprit: false,
        guiltExplanation: '',
      },
    ]);
  };

  const handleRemoveSuspect = (idx: number) => {
    if (suspectsList.length <= 1) return;
    setSuspectsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSuspect = (idx: number, field: keyof SuspectInput, val: any) => {
    setSuspectsList((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleAddEvidence = () => {
    setEvidenceList((prev) => [
      ...prev,
      {
        docNumber: `DOC-0${prev.length + 1}`,
        title: '',
        type: 'witness_statement',
        source: '',
        content: '',
      },
    ]);
  };

  const handleRemoveEvidence = (idx: number) => {
    if (evidenceList.length <= 1) return;
    setEvidenceList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateEvidence = (idx: number, field: keyof EvidenceInput, val: string) => {
    setEvidenceList((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !crimeScene.trim() || suspectsList.length === 0) return;

    setIsSubmitting(true);
    const caseId = `case-${Date.now()}`;

    // Find the marked culprit or default to first suspect
    const culpritSuspect = suspectsList.find((s) => s.isCulprit) || suspectsList[0];
    const culpritId = `susp-${caseId}-${culpritSuspect.name.toLowerCase().replace(/\s+/g, '-')}`;

    // Format final suspects (using text-only SVG deterministic avatars, zero file uploads!)
    const formattedSuspects: Suspect[] = suspectsList.map((s, i) => {
      const sId = `susp-${caseId}-${s.name.toLowerCase().replace(/\s+/g, '-') || i}`;
      return {
        id: sId,
        caseId,
        name: s.name.trim() || `Suspect ${i + 1}`,
        role: s.role.trim() || 'Person of Interest',
        // Clean deterministic text-only avatar URL:
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(s.name || `Suspect${i}`)}`,
        motive: s.motive.trim() || 'Undisclosed motive',
        opportunity: `Present on-site between ${s.checkInTime || 'N/A'} and ${s.checkOutTime || 'N/A'}.`,
        alibi: s.alibi.trim() || 'No alibi provided.',
        checkInTime: s.checkInTime || 'Unrecorded',
        checkOutTime: s.checkOutTime || 'Unrecorded',
        guidelines: s.guidelines || '',
        status: s.isCulprit ? 'prime_suspect' : 'person_of_interest',
        blameConfidence: s.isCulprit ? 80 : 25,
        motiveScore: s.isCulprit ? 90 : 40,
        opportunityScore: s.isCulprit ? 85 : 35,
        alibiSolidness: s.isCulprit ? 20 : 80,
        isCulprit: s.isCulprit,
        guiltExplanation: s.guiltExplanation || (s.isCulprit ? 'Guilty based on evidence.' : 'Innocent.'),
        claims: [
          {
            id: `cl-${sId}-1`,
            claim: s.alibi,
            type: 'fact',
            confidence: s.isCulprit ? 20 : 90,
            isContradicted: s.isCulprit,
          },
        ],
      };
    });

    // Format final documents (pure text data, zero image storage!)
    const formattedDocs: EvidenceDoc[] = evidenceList.map((e, i) => ({
      id: `doc-${caseId}-${i + 1}`,
      caseId,
      docNumber: e.docNumber || `DOC-0${i + 1}`,
      title: e.title.trim() || `Evidence Exhibit #${i + 1}`,
      type: (e.type as any) || 'witness_statement',
      dateOrTime: timeOfCrime || 'Night of incident',
      source: e.source.trim() || 'Investigator Records',
      content: e.content.trim() || 'No additional notes provided.',
      entityTags: {
        people: suspectsList.map((s) => s.name).filter(Boolean),
        locations: [crimeScene],
        timestamps: [timeOfCrime, ...suspectsList.map((s) => s.checkInTime).filter(Boolean)],
        keyActions: ['Incident recorded', 'Exited premises'],
      },
    }));

    const newMystery: MysteryCase = {
      id: caseId,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom Investigation Dossier',
      difficulty,
      crimeScene: crimeScene.trim(),
      timeOfCrime: timeOfCrime.trim() || 'Estimated 10:00 PM – 11:30 PM',
      victimOrTarget: victimOrTarget.trim() || 'Unspecified target',
      summary: summary.trim() || `An incident occurred at ${crimeScene}. Review suspect alibis and check-in times to solve the case.`,
      dossierBriefing: summary.trim() || `Investigate ${title}. Cross-examine the evidence and interrogate suspects with Myri AI.`,
      tags: ['Custom Case', difficulty, 'Firestore Saved'],
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      culpritId: formattedSuspects.find((s) => s.isCulprit)?.id || formattedSuspects[0].id,
      recommendedOrder: formattedDocs.map((d) => d.docNumber),
      totalCluesCount: formattedDocs.length,
    };

    await addNewCase(newMystery, formattedDocs, formattedSuspects);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-dark-900 border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-dark-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ai-blue to-crime-red flex items-center justify-center text-white shadow-blue-glow">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Add New Case (Custom Mystery)
              </h3>
              <p className="text-xs text-slate-400">
                Stored in Firestore (Text-only data, zero image storage required)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: Incident & Problem */}
          <div className="space-y-3.5 bg-dark-950/70 p-4 rounded-2xl border border-white/5">
            <h4 className="text-xs uppercase font-extrabold text-ai-cyan tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>1. Incident Details & Location</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Stolen Diamond Necklace"
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-ai-blue font-sans"
                >
                  <option value="Easy">Easy (Straightforward)</option>
                  <option value="Twisted">Twisted (Red Herrings)</option>
                  <option value="Impossible">Impossible (High Complexity)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                  Location Lost / Crime Scene *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={crimeScene}
                    onChange={(e) => setCrimeScene(e.target.value)}
                    placeholder="e.g. Grand Hotel Room 402"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                  Incident Time Window *
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={timeOfCrime}
                    onChange={(e) => setTimeOfCrime(e.target.value)}
                    placeholder="e.g. 10:30 PM – 11:15 PM"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                  What was Lost / Target *
                </label>
                <div className="relative">
                  <Target className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={victimOrTarget}
                    onChange={(e) => setVictimOrTarget(e.target.value)}
                    placeholder="e.g. 24K Diamond Necklace"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                Incident Problem & Summary *
              </label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe what occurred, who reported the crime, and what is missing..."
                className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
              />
            </div>
          </div>

          {/* SECTION 2: Suspects Information, Check-in/out, Guidelines */}
          <div className="space-y-4 bg-dark-950/70 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-extrabold text-ai-cyan tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>2. Suspects Information ({suspectsList.length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddSuspect}
                className="text-xs font-bold text-ai-cyan bg-ai-blue/15 hover:bg-ai-blue/25 border border-ai-blue/30 px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Suspect</span>
              </button>
            </div>

            <div className="space-y-4">
              {suspectsList.map((suspect, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                    suspect.isCulprit
                      ? 'bg-crime-red/5 border-crime-red/40'
                      : 'bg-dark-900 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-ai-blue/20 text-ai-cyan flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{suspect.name || `Suspect #${idx + 1}`}</span>
                    </span>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1.5 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={suspect.isCulprit}
                          onChange={(e) => handleUpdateSuspect(idx, 'isCulprit', e.target.checked)}
                          className="accent-crime-red w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-bold text-crime-lightred">
                          Guilty Culprit
                        </span>
                      </label>

                      {suspectsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSuspect(idx)}
                          className="text-slate-500 hover:text-crime-lightred p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={suspect.name}
                      onChange={(e) => handleUpdateSuspect(idx, 'name', e.target.value)}
                      placeholder="Suspect Full Name"
                      className="bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                    />
                    <input
                      type="text"
                      required
                      value={suspect.role}
                      onChange={(e) => handleUpdateSuspect(idx, 'role', e.target.value)}
                      placeholder="Role (e.g. Butler, Guest, Security)"
                      className="bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                    />
                  </div>

                  {/* Motive & Alibi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Alleged Motive:
                      </label>
                      <input
                        type="text"
                        value={suspect.motive}
                        onChange={(e) => handleUpdateSuspect(idx, 'motive', e.target.value)}
                        placeholder="e.g. Secret gambling debts"
                        className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Claimed Alibi:
                      </label>
                      <input
                        type="text"
                        value={suspect.alibi}
                        onChange={(e) => handleUpdateSuspect(idx, 'alibi', e.target.value)}
                        placeholder="e.g. Claims was in kitchen polishing silver"
                        className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                      />
                    </div>
                  </div>

                  {/* Check-in / Check-out Times & Guidelines */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Check-in Time:
                      </label>
                      <input
                        type="text"
                        value={suspect.checkInTime}
                        onChange={(e) => handleUpdateSuspect(idx, 'checkInTime', e.target.value)}
                        placeholder="e.g. 10:05 PM"
                        className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Check-out Time:
                      </label>
                      <input
                        type="text"
                        value={suspect.checkOutTime}
                        onChange={(e) => handleUpdateSuspect(idx, 'checkOutTime', e.target.value)}
                        placeholder="e.g. 11:25 PM"
                        className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        Suspect Guidelines / Notes:
                      </label>
                      <input
                        type="text"
                        value={suspect.guidelines}
                        onChange={(e) => handleUpdateSuspect(idx, 'guidelines', e.target.value)}
                        placeholder="e.g. Check kitchen camera logs"
                        className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                      />
                    </div>
                  </div>

                  {suspect.isCulprit && (
                    <div className="pt-1">
                      <label className="text-[10px] text-crime-lightred font-bold block mb-0.5">
                        Why are they guilty? (Hidden proof used by Myri AI):
                      </label>
                      <input
                        type="text"
                        value={suspect.guiltExplanation}
                        onChange={(e) => handleUpdateSuspect(idx, 'guiltExplanation', e.target.value)}
                        placeholder="e.g. Kitchen log shows he left at 10:20 PM and swiped master key."
                        className="w-full bg-dark-950 border border-crime-red/30 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-crime-red font-sans"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Evidence Documents */}
          <div className="space-y-4 bg-dark-950/70 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-extrabold text-ai-cyan tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>3. Case Evidence & Exhibits ({evidenceList.length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddEvidence}
                className="text-xs font-bold text-ai-cyan bg-ai-blue/15 hover:bg-ai-blue/25 border border-ai-blue/30 px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clue Exhibit</span>
              </button>
            </div>

            <div className="space-y-3">
              {evidenceList.map((doc, idx) => (
                <div key={idx} className="p-3 bg-dark-900 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ai-cyan">{doc.docNumber}</span>
                    {evidenceList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(idx)}
                        className="text-slate-500 hover:text-crime-lightred"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={doc.title}
                      onChange={(e) => handleUpdateEvidence(idx, 'title', e.target.value)}
                      placeholder="Exhibit Title (e.g. Keycard Swipe Log)"
                      className="bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                    />
                    <input
                      type="text"
                      value={doc.source}
                      onChange={(e) => handleUpdateEvidence(idx, 'source', e.target.value)}
                      placeholder="Source (e.g. Hotel Security Server)"
                      className="bg-dark-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                    />
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={doc.content}
                    onChange={(e) => handleUpdateEvidence(idx, 'content', e.target.value)}
                    placeholder="Exhibit Content: Detail the timestamps, quotes, or telemetry that provide the clues..."
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-ai-blue font-sans"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ai-blue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white font-extrabold text-xs sm:text-sm shadow-blue-glow transition-all flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Saving to Firestore...' : 'Save & Publish Mystery Case'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

