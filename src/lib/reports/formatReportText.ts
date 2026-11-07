import { FinalReport, MysteryCase } from '@/types/detective';

export function formatReportAsPlainText(report: Partial<FinalReport>, caseInfo: MysteryCase): string {
  const verdictText = report.verdict === 'SOLVED' 
    ? 'CASE OFFICIALLY SOLVED — GUILTY INDICTMENT CONFIRMED' 
    : 'MISDIRECTION FLAGGED — FALSE ACCUSATION DETECTED';

  const separator = '============================================================';
  const subSeparator = '------------------------------------------------------------';

  const evidenceLines = (report.evidenceTrail && report.evidenceTrail.length > 0)
    ? report.evidenceTrail.map((item, idx) => `  [EXHIBIT-TRAIL ${idx + 1}] ${item}`).join('\n')
    : '  No physical exhibits linked.';

  const contradictionLines = (report.contradictionBreakdown && report.contradictionBreakdown.length > 0)
    ? report.contradictionBreakdown.map((item, idx) => `  [CONTRADICTION ${idx + 1}] ${item}`).join('\n')
    : '  No direct contradictions recorded.';

  return [
    separator,
    '          MYRI AI FORENSIC CASE STUDY REPORT',
    '       (Stored in Text Format in Firebase Firestore)',
    separator,
    `REPORT ID: ${report.id || `rep-${Date.now()}`}`,
    `CASE FILE: ${caseInfo.title}`,
    `CASE ID: ${caseInfo.id}`,
    `DIFFICULTY LEVEL: ${caseInfo.difficulty}`,
    `CRIME SCENE / LOCATION: ${caseInfo.crimeScene}`,
    `INCIDENT TIME WINDOW: ${caseInfo.timeOfCrime}`,
    `TARGET / STOLEN ASSET: ${caseInfo.victimOrTarget}`,
    `FILING TIMESTAMP: ${report.timestamp || new Date().toISOString()}`,
    `DATABASE STORAGE: Firebase Firestore (Free Tier / Text Format)`,
    '',
    subSeparator,
    'SECTION 1: OFFICIAL VERDICT & PROSECUTION RESULT',
    subSeparator,
    `ACCUSED SUSPECT: ${report.accusedSuspectName} (Suspect ID: ${report.accusedSuspectId})`,
    `VERDICT STATUS: ${verdictText}`,
    `CONFIDENCE SCORE: ${report.accuracyScore ?? 95}%`,
    `DETECTIVE RANKING: ${report.aiDetectiveGrade || 'S - Master Sleuth'}`,
    `INVESTIGATOR CERTAINTY: ${report.confidenceRating ?? 85}%`,
    '',
    subSeparator,
    'SECTION 2: EXECUTIVE SUMMARY & CRIME RECONSTRUCTION',
    subSeparator,
    report.executiveSummary || 'No executive summary provided.',
    '',
    subSeparator,
    'SECTION 3: GROUNDED EVIDENCE TRAIL & EXHIBIT CORROBORATION',
    subSeparator,
    evidenceLines,
    '',
    subSeparator,
    'SECTION 4: IDENTIFIED CONTRADICTIONS & TIMELINE FLAWS',
    subSeparator,
    contradictionLines,
    '',
    subSeparator,
    'SECTION 5: MOTIVE & OPPORTUNITY DECONSTRUCTION',
    subSeparator,
    `ESTABLISHED MOTIVE: ${report.motiveBreakdown || 'Motive verified through financial / access anomalies.'}`,
    '',
    subSeparator,
    'SECTION 6: FINAL DISPOSITION',
    subSeparator,
    report.verdict === 'SOLVED'
      ? 'DISPOSITION: CASE CLOSED. Evidence threshold achieved beyond reasonable doubt.'
      : 'DISPOSITION: CASE RE-OPENED. Accusation ungrounded; inspect additional exhibits.',
    'DATA INTEGRITY: 100% Text-based Document Model. Zero binary storage quota used.',
    separator
  ].join('\n');
}

