'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MysteryCase, 
  EvidenceDoc, 
  Suspect, 
  TimelineNode, 
  Contradiction, 
  ChatMessage, 
  FinalReport, 
  ExtractionResult 
} from '@/types/detective';
import { 
  PRELOADED_CASES, 
  PRELOADED_DOCUMENTS, 
  PRELOADED_SUSPECTS, 
  PRELOADED_TIMELINES, 
  PRELOADED_CONTRADICTIONS 
} from '@/data/mockCases';
import { db, isFirebaseConfigured, doc, setDoc, getDoc, deleteDoc } from '@/lib/firebase/client';
import { formatReportAsPlainText } from '@/lib/reports/formatReportText';
import { useAuth } from './AuthContext';

interface CaseContextType {
  cases: MysteryCase[];
  activeCase: MysteryCase | null;
  selectCase: (caseId: string) => void;
  documents: EvidenceDoc[];
  activeDoc: EvidenceDoc | null;
  setActiveDoc: (doc: EvidenceDoc | null) => void;
  suspects: Suspect[];
  updateSuspectBlame: (suspectId: string, blame: number) => void;
  updateSuspectStatus: (suspectId: string, status: Suspect['status']) => void;
  timelines: TimelineNode[];
  contradictions: Contradiction[];
  toggleContradictionResolved: (contraId: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => Promise<void>;
  isChatLoading: boolean;
  extractDocEntities: (docId: string) => Promise<void>;
  extractingDocId: string | null;
  finalReport: FinalReport | null;
  generateReport: (accusedSuspectId: string, notes?: string) => Promise<FinalReport | null>;
  isGeneratingReport: boolean;
  closeReportModal: () => void;
  solvedCases: Record<string, boolean>;
  userNotes: string;
  setUserNotes: (notes: string) => void;
  syncWithFirestore: () => Promise<void>;
  isSyncing: boolean;
  addNewCase: (newCase: MysteryCase, newDocs: EvidenceDoc[], newSuspects: Suspect[]) => Promise<void>;
  deleteCustomCase: (caseId: string) => Promise<void>;
  savedReports: FinalReport[];
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cases, setCases] = useState<MysteryCase[]>(PRELOADED_CASES);
  const [activeCase, setActiveCase] = useState<MysteryCase | null>(PRELOADED_CASES[0]);

  // Load custom cases from localStorage on mount
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem('myri_custom_cases');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCases([...parsed, ...PRELOADED_CASES]);
        }
      }
    } catch {}
  }, []);

  const [documents, setDocuments] = useState<EvidenceDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<EvidenceDoc | null>(null);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [timelines, setTimelines] = useState<TimelineNode[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [extractingDocId, setExtractingDocId] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [savedReports, setSavedReports] = useState<FinalReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [solvedCases, setSolvedCases] = useState<Record<string, boolean>>({});
  const [userNotes, setUserNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Load custom cases and saved text reports from localStorage on mount
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem('myri_custom_cases');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCases([...parsed, ...PRELOADED_CASES]);
        }
      }
      const savedReps = localStorage.getItem('myri_case_reports');
      if (savedReps) {
        const parsedReps = JSON.parse(savedReps);
        if (Array.isArray(parsedReps)) {
          setSavedReports(parsedReps);
        }
      }
    } catch {}
  }, []);

  // Initialize data when activeCase changes
  useEffect(() => {
    if (!activeCase) return;
    const caseId = activeCase.id;

    // Check localStorage for saved case state
    const savedKey = `detective_state_${caseId}`;
    const savedData = typeof window !== 'undefined' ? localStorage.getItem(savedKey) : null;

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setDocuments(parsed.documents || PRELOADED_DOCUMENTS[caseId] || []);
        setSuspects(parsed.suspects || PRELOADED_SUSPECTS[caseId] || []);
        setTimelines(parsed.timelines || PRELOADED_TIMELINES[caseId] || []);
        setContradictions(parsed.contradictions || PRELOADED_CONTRADICTIONS[caseId] || []);
        setUserNotes(parsed.userNotes || '');
        setFinalReport(parsed.finalReport || null);
        setActiveDoc(parsed.documents?.[0] || PRELOADED_DOCUMENTS[caseId]?.[0] || null);
      } catch {
        loadFreshCase(caseId);
      }
    } else {
      loadFreshCase(caseId);
    }

    // Default welcome prompt with Audio & Suspect Voice Inquiry
    setChatMessages([
      {
        id: `msg-welcome-${caseId}`,
        caseId,
        role: 'assistant',
        content: `Greetings, Detective! I am your Gemini AI Assistant. How can I help you investigate **"${activeCase.title}"**?\n\nYou can ask me about any person or suspect (e.g. *"Who is Michael and was he at the scene?"* or *"What is Maya's alibi?"*), inspect access logs, or click the **🔊 Play Audio** button to listen to voice analysis aloud!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'Who is Michael? Was he present at the crime scene?',
          'What are the primary contradictions in this case?',
          'Who had both motive and physical opportunity?',
        ],
      },
    ]);
  }, [activeCase]);

  const loadFreshCase = (caseId: string) => {
    const docs = PRELOADED_DOCUMENTS[caseId] || [];
    setDocuments(docs);
    setActiveDoc(docs[0] || null);
    setSuspects(PRELOADED_SUSPECTS[caseId] || []);
    setTimelines(PRELOADED_TIMELINES[caseId] || []);
    setContradictions(PRELOADED_CONTRADICTIONS[caseId] || []);
    setUserNotes('');
    setFinalReport(null);
  };

  // Save current case state to localStorage
  useEffect(() => {
    if (!activeCase || typeof window === 'undefined') return;
    const key = `detective_state_${activeCase.id}`;
    const payload = {
      documents,
      suspects,
      timelines,
      contradictions,
      userNotes,
      finalReport,
    };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {}
  }, [activeCase, documents, suspects, timelines, contradictions, userNotes, finalReport]);

  const selectCase = (caseId: string) => {
    const found = cases.find((c) => c.id === caseId);
    if (found) {
      setActiveCase(found);
    }
  };

  const updateSuspectBlame = (suspectId: string, blame: number) => {
    setSuspects((prev) =>
      prev.map((s) => (s.id === suspectId ? { ...s, blameConfidence: blame } : s))
    );
  };

  const updateSuspectStatus = (suspectId: string, status: Suspect['status']) => {
    setSuspects((prev) =>
      prev.map((s) => (s.id === suspectId ? { ...s, status } : s))
    );
  };

  const toggleContradictionResolved = (contraId: string) => {
    setContradictions((prev) =>
      prev.map((c) => (c.id === contraId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const extractDocEntities = async (docId: string) => {
    const targetDoc = documents.find((d) => d.id === docId);
    if (!targetDoc) return;

    setExtractingDocId(docId);
    try {
      const res = await fetch('/api/gemini/extract-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc: targetDoc }),
      });

      if (!res.ok) throw new Error('Failed to extract entities');
      const data: ExtractionResult = await res.json();

      // Update doc with extracted entities
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                entityTags: {
                  people: Array.from(new Set([...d.entityTags.people, ...data.entities.people])),
                  locations: Array.from(new Set([...d.entityTags.locations, ...data.entities.locations])),
                  timestamps: Array.from(new Set([...d.entityTags.timestamps, ...data.entities.timestamps])),
                  keyActions: Array.from(new Set([...d.entityTags.keyActions, ...data.entities.keyActions])),
                },
                extractedNodesCount: data.extractedTimelineNodes.length,
              }
            : d
        )
      );

      // If activeDoc is the one being extracted, update it too
      if (activeDoc?.id === docId) {
        setActiveDoc((prev) =>
          prev
            ? {
                ...prev,
                entityTags: {
                  people: Array.from(new Set([...prev.entityTags.people, ...data.entities.people])),
                  locations: Array.from(new Set([...prev.entityTags.locations, ...data.entities.locations])),
                  timestamps: Array.from(new Set([...prev.entityTags.timestamps, ...data.entities.timestamps])),
                  keyActions: Array.from(new Set([...prev.entityTags.keyActions, ...data.entities.keyActions])),
                },
                extractedNodesCount: data.extractedTimelineNodes.length,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setExtractingDocId(null);
    }
  };

  const sendChatMessage = async (content: string) => {
    if (!activeCase || !content.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      caseId: activeCase.id,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const historyForApi = chatMessages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

      const res = await fetch('/api/gemini/investigate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseInfo: activeCase,
          documents,
          suspects,
          chatHistory: historyForApi,
          userQuery: content,
        }),
      });

      if (!res.ok) throw new Error('Chat API returned error');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        caseId: activeCase.id,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        suggestedPrompts: data.suggestedPrompts || [],
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        caseId: activeCase.id,
        role: 'assistant',
        content: `Investigator, I encountered a temporary disruption in satellite forensic link. Cross-examine **[DOC-01]** and **[DOC-02]** while I re-establish connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ['DOC-01', 'DOC-02'],
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const persistReportToFirestore = async (rawReport: FinalReport): Promise<FinalReport> => {
    if (!activeCase) return rawReport;
    const plainText = formatReportAsPlainText(rawReport, activeCase);
    const enrichedReport: FinalReport = {
      ...rawReport,
      caseTitle: activeCase.title,
      caseDifficulty: activeCase.difficulty,
      fullReportText: plainText,
      format: 'text/plain',
      storedInFirestore: false,
    };

    // 1. Direct Firestore Free-Tier Document Write (Text format)
    if (db && isFirebaseConfigured) {
      try {
        const reportDocRef = doc(db, 'case_study_reports', enrichedReport.id);
        await setDoc(reportDocRef, {
          id: enrichedReport.id,
          caseId: enrichedReport.caseId,
          caseTitle: activeCase.title,
          caseDifficulty: activeCase.difficulty,
          accusedSuspectId: enrichedReport.accusedSuspectId,
          accusedSuspectName: enrichedReport.accusedSuspectName,
          verdict: enrichedReport.verdict,
          accuracyScore: enrichedReport.accuracyScore,
          confidenceRating: enrichedReport.confidenceRating,
          executiveSummary: enrichedReport.executiveSummary,
          evidenceTrail: enrichedReport.evidenceTrail,
          contradictionBreakdown: enrichedReport.contradictionBreakdown,
          motiveBreakdown: enrichedReport.motiveBreakdown,
          aiDetectiveGrade: enrichedReport.aiDetectiveGrade,
          fullReportText: plainText,
          format: 'text/plain',
          timestamp: enrichedReport.timestamp,
          storedAt: new Date().toISOString(),
        }, { merge: true });
        enrichedReport.storedInFirestore = true;
      } catch (err) {
        console.warn('Firestore direct write notice:', err);
      }
    }

    // 2. Server-side persistence via API
    try {
      const apiRes = await fetch('/api/firestore/case-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedReport),
      });
      if (apiRes.ok) {
        enrichedReport.storedInFirestore = true;
      }
    } catch {}

    // 3. LocalStorage persistence
    try {
      const saved = localStorage.getItem('myri_case_reports');
      const list: FinalReport[] = saved ? JSON.parse(saved) : [];
      const updated = [enrichedReport, ...list.filter((r) => r.id !== enrichedReport.id)];
      localStorage.setItem('myri_case_reports', JSON.stringify(updated));
      setSavedReports(updated);
    } catch {}

    return enrichedReport;
  };

  const generateReport = async (accusedSuspectId: string, notes?: string): Promise<FinalReport | null> => {
    if (!activeCase) return null;
    const accused = suspects.find((s) => s.id === accusedSuspectId);
    if (!accused) return null;

    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseInfo: activeCase,
          accusedSuspect: accused,
          allSuspects: suspects,
          documents,
          investigatorNotes: notes || userNotes,
          confidenceRating: accused.blameConfidence,
        }),
      });

      if (!res.ok) throw new Error('Report API error');
      const rawReport: FinalReport = await res.json();
      const savedReport = await persistReportToFirestore(rawReport);

      setFinalReport(savedReport);
      if (savedReport.verdict === 'SOLVED') {
        setSolvedCases((prev) => ({ ...prev, [activeCase.id]: true }));
      }
      return savedReport;
    } catch (err) {
      console.error('Generate report error, using client-side fallback:', err);
      const isCorrect = accused.id === activeCase.culpritId;
      const accuracyScore = isCorrect ? 96 : 30;
      const fallbackRep: FinalReport = {
        id: `rep-${Date.now()}`,
        caseId: activeCase.id,
        accusedSuspectId: accused.id,
        accusedSuspectName: accused.name,
        verdict: isCorrect ? 'SOLVED' : 'MISDIRECTION',
        accuracyScore,
        confidenceRating: accused.blameConfidence || 85,
        executiveSummary: isCorrect
          ? `OFFICIAL INDICTMENT: The investigation concludes with the indictment of ${accused.name} (${accused.role}). Grounded in keycard logs, telemetry contradictions, and physical evidence recovery.`
          : `CASE FLAGGED - FALSE ACCUSATION: The prosecution of ${accused.name} is contradicted by corroborated alibis. The true culprit intentionally misdirected the investigation.`,
        evidenceTrail: isCorrect
          ? [
              'Alibi departure time directly contradicted by biometric keycard swipe logs.',
              'Local network telemetry records on-site device association.',
              'Eyewitness encounter confirms suspect leaving via emergency exit carrying stolen goods.',
            ]
          : [
              'Suspect possessed verifiable alibis for the critical window.',
              'Attributed electronic indicators were spoofed or borrowed.',
            ],
        contradictionBreakdown: isCorrect
          ? [
              'Claimed departure contradicted by electronic badge swipe.',
              'Cellular dinner claim contradicted by local office Wi-Fi association.',
            ]
          : [
              'Target was framed through forged or borrowed credentials.',
            ],
        motiveBreakdown: accused.motive,
        aiDetectiveGrade: isCorrect ? 'S - Master Sleuth' : 'F - Misdirected Accusation',
        timestamp: new Date().toISOString(),
      };
      const savedFallback = await persistReportToFirestore(fallbackRep);
      setFinalReport(savedFallback);
      if (savedFallback.verdict === 'SOLVED') {
        setSolvedCases((prev) => ({ ...prev, [activeCase.id]: true }));
      }
      return savedFallback;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const closeReportModal = () => {
    setFinalReport(null);
  };

  const syncWithFirestore = async () => {
    if (!activeCase || !user) return;
    setIsSyncing(true);
    try {
      if (isFirebaseConfigured && db) {
        const progressRef = doc(db, 'investigation_progress', `${user.uid}_${activeCase.id}`);
        await setDoc(progressRef, {
          userId: user.uid,
          caseId: activeCase.id,
          suspects,
          userNotes,
          finalReport,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        // Mock remote sync delay
        await new Promise((r) => setTimeout(r, 600));
      }
    } catch (err) {
      console.error('Firestore sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const addNewCase = async (
    newCase: MysteryCase,
    newDocs: EvidenceDoc[],
    newSuspects: Suspect[]
  ) => {
    // 1. Prepend new case to cases state
    setCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);

    // 2. Cache in localStorage
    const key = `detective_state_${newCase.id}`;
    const payload = {
      documents: newDocs,
      suspects: newSuspects,
      timelines: [],
      contradictions: [],
      userNotes: '',
      finalReport: null,
    };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      const savedCustom = localStorage.getItem('myri_custom_cases');
      const list: MysteryCase[] = savedCustom ? JSON.parse(savedCustom) : [];
      localStorage.setItem(
        'myri_custom_cases',
        JSON.stringify([newCase, ...list.filter((c) => c.id !== newCase.id)])
      );
    } catch {}

    // 3. Persist to Firestore (Text data only!)
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'cases', newCase.id), newCase, { merge: true });
        for (const d of newDocs) {
          await setDoc(doc(db, 'evidence_docs', d.id), d, { merge: true });
        }
        for (const s of newSuspects) {
          await setDoc(doc(db, 'suspects', s.id), s, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    }

    // 4. Select newly created case immediately
    setActiveCase(newCase);
    setDocuments(newDocs);
    setActiveDoc(newDocs[0] || null);
    setSuspects(newSuspects);
  };

  const deleteCustomCase = async (caseId: string) => {
    // 1. Remove from local state
    setCases(prev => prev.filter(c => c.id !== caseId));

    // 2. Remove from localStorage
    try {
      const savedCustom = localStorage.getItem('myri_custom_cases');
      if (savedCustom) {
        const parsed: MysteryCase[] = JSON.parse(savedCustom);
        const filtered = parsed.filter(c => c.id !== caseId);
        localStorage.setItem('myri_custom_cases', JSON.stringify(filtered));
      }
      localStorage.removeItem(`detective_state_${caseId}`);
    } catch {}

    // 3. Remove from Firestore if configured
    if (db && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'cases', caseId));
      } catch (err) {
        console.warn('Firestore deletion notice:', err);
      }
    }

    // 4. If the active case was deleted, switch to the first preloaded case
    if (activeCase?.id === caseId) {
      setActiveCase(PRELOADED_CASES[0]);
    }
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        activeCase,
        selectCase,
        documents,
        activeDoc,
        setActiveDoc,
        suspects,
        updateSuspectBlame,
        updateSuspectStatus,
        timelines,
        contradictions,
        toggleContradictionResolved,
        chatMessages,
        sendChatMessage,
        isChatLoading,
        extractDocEntities,
        extractingDocId,
        finalReport,
        generateReport,
        isGeneratingReport,
        closeReportModal,
        solvedCases,
        userNotes,
        setUserNotes,
        syncWithFirestore,
        isSyncing,
        addNewCase,
        deleteCustomCase,
        savedReports,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
}

