export type Difficulty = 'Easy' | 'Twisted' | 'Impossible';

export interface EntityTags {
  people: string[];
  locations: string[];
  timestamps: string[];
  keyActions: string[];
}

export type DocumentType = 
  | 'witness_statement' 
  | 'email' 
  | 'chat_log' 
  | 'cctv_log' 
  | 'forensic_report' 
  | 'badge_swipe' 
  | 'phone_record';

export interface EvidenceDoc {
  id: string;
  caseId: string;
  docNumber: string; // e.g. "DOC-01"
  title: string;
  type: DocumentType;
  dateOrTime: string;
  source: string;
  content: string;
  author?: string;
  recipient?: string;
  isRedHerring?: boolean;
  entityTags: EntityTags;
  extractedNodesCount?: number;
}

export type SuspectStatus = 'cleared' | 'person_of_interest' | 'prime_suspect';
export type ClaimType = 'fact' | 'assumption' | 'speculation';

export interface SuspectClaim {
  id: string;
  claim: string;
  type: ClaimType;
  confidence: number; // 0 - 100
  sourceDocNumber?: string;
  isContradicted?: boolean;
}

export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  role: string;
  avatar: string;
  motive: string;
  opportunity: string;
  alibi: string;
  checkInTime?: string;
  checkOutTime?: string;
  guidelines?: string;
  status: SuspectStatus;
  blameConfidence: number; // 0 - 100 slider / user metric
  motiveScore: number; // 0 - 100
  opportunityScore: number; // 0 - 100
  alibiSolidness: number; // 0 - 100
  claims: SuspectClaim[];
  isCulprit: boolean; // internal ground truth for grading
  guiltExplanation: string;
}

export interface TimelineNode {
  id: string;
  caseId: string;
  timestamp: string; // ISO or human readable
  displayTime: string; // e.g. "09:45 PM"
  title: string;
  description: string;
  entitiesInvolved: string[];
  location: string;
  sourceDocNumber: string;
  verified: boolean;
  isKeyEvidence: boolean;
}

export interface Contradiction {
  id: string;
  caseId: string;
  title: string;
  severity: 'critical' | 'high' | 'moderate';
  docANumber: string;
  docBNumber: string;
  suspectId?: string;
  description: string;
  aiReasoning: string;
  resolved: boolean;
}

export interface MysteryCase {
  id: string;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  crimeScene: string;
  timeOfCrime: string;
  victimOrTarget: string;
  summary: string;
  dossierBriefing: string;
  tags: string[];
  coverImage: string;
  culpritId: string;
  recommendedOrder: string[];
  totalCluesCount: number;
}

export interface ChatMessage {
  id: string;
  caseId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[]; // list of DOC-XX citations
  suggestedPrompts?: string[];
}

export interface FinalReport {
  id: string;
  caseId: string;
  caseTitle?: string;
  caseDifficulty?: Difficulty;
  userId?: string;
  accusedSuspectId: string;
  accusedSuspectName: string;
  verdict: 'SOLVED' | 'MISDIRECTION';
  accuracyScore: number; // 0 - 100
  confidenceRating: number;
  executiveSummary: string;
  evidenceTrail: string[];
  contradictionBreakdown: string[];
  motiveBreakdown: string;
  aiDetectiveGrade: string; // "S - Master Sleuth", "A - Senior Detective", etc.
  fullReportText?: string; // Pure text format stored in Firebase Firestore
  format?: 'text/plain';
  storedInFirestore?: boolean;
  timestamp: string;
}

export interface ExtractionResult {
  entities: EntityTags;
  summary: string;
  extractedTimelineNodes: Array<{
    timestamp: string;
    displayTime: string;
    title: string;
    description: string;
    location: string;
    entitiesInvolved: string[];
    isKeyEvidence: boolean;
  }>;
  potentialContradictions: Array<{
    targetDocNumber?: string;
    description: string;
    severity: 'critical' | 'high' | 'moderate';
  }>;
}

