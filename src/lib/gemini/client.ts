import { GoogleGenAI } from '@google/genai';
import { EvidenceDoc, MysteryCase, Suspect, ExtractionResult, FinalReport } from '@/types/detective';

export const isGeminiConfigured = Boolean(
  process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY.trim() !== '' &&
  process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
);

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Resilient model cascade to handle Google's temporary 503 demand spikes
const CASCADE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

async function callGeminiCascade(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<string | null> {
  for (const model of CASCADE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini model [${model}] returned status ${err.status || err.message?.slice(0, 50)} — failing over to next model.`);
    }
  }
  return null;
}

// Clean markdown fences from JSON responses
function parseSafeJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// 1. Evidence Extraction Engine
// ---------------------------------------------------------------------------
export async function extractEntitiesWithGemini(doc: EvidenceDoc): Promise<ExtractionResult> {
  const safeTags = doc.entityTags || { people: [], locations: [], timestamps: [], keyActions: [] };
  const safePeople = safeTags.people || [];
  const safeLocations = safeTags.locations || [];
  const safeTimestamps = safeTags.timestamps || [];
  const safeKeyActions = safeTags.keyActions || [];

  const fallbackResult: ExtractionResult = {
    entities: {
      people: safePeople,
      locations: safeLocations,
      timestamps: safeTimestamps,
      keyActions: safeKeyActions,
    },
    summary: `Analyzed ${doc.docNumber || 'DOC'}: ${doc.title || 'Exhibit'}. Extracted ${safePeople.length} people and ${safeLocations.length} locations.`,
    extractedTimelineNodes: [
      {
        timestamp: new Date().toISOString(),
        displayTime: doc.dateOrTime || 'Unknown Time',
        title: `Exhibit: ${doc.title || 'Evidence Exhibit'}`,
        description: (doc.content || '').slice(0, 140) + '...',
        location: safeLocations[0] || 'Scene',
        entitiesInvolved: safePeople,
        isKeyEvidence: true,
      },
    ],
    potentialContradictions: [],
  };

  const ai = getGeminiClient();
  if (!ai) return fallbackResult;

  const prompt = `You are a Senior Cyber-Forensic Investigator.
Analyze the following document and return a valid JSON object with exact fields:
- "summary": string
- "entities": { "people": string[], "locations": string[], "timestamps": string[], "keyActions": string[] }
- "extractedTimelineNodes": [ { "timestamp": string, "displayTime": string, "title": string, "description": string, "location": string, "entitiesInvolved": string[], "isKeyEvidence": boolean } ]
- "potentialContradictions": [ { "targetDocNumber": string, "description": string, "severity": "critical" | "high" | "moderate" } ]

Document: ${doc.docNumber || 'DOC'} - ${doc.title || 'Exhibit'}
Source: ${doc.source || 'File'}
Content:
"""
${doc.content || ''}
"""`;

  try {
    const raw = await callGeminiCascade(ai, prompt, { responseMimeType: 'application/json' });
    if (!raw) return fallbackResult;

    const parsed = parseSafeJson<any>(raw, null);
    if (!parsed) return fallbackResult;

    return {
      summary: parsed.summary || fallbackResult.summary,
      entities: {
        people: parsed.entities?.people || safePeople,
        locations: parsed.entities?.locations || safeLocations,
        timestamps: parsed.entities?.timestamps || safeTimestamps,
        keyActions: parsed.entities?.keyActions || safeKeyActions,
      },
      extractedTimelineNodes: parsed.extractedTimelineNodes || fallbackResult.extractedTimelineNodes,
      potentialContradictions: parsed.potentialContradictions || [],
    };
  } catch (error) {
    console.error('Gemini extraction error, using fallback:', error);
    return fallbackResult;
  }
}

// ---------------------------------------------------------------------------
// 2. Investigator Assistant Chat (Strict Source Citations)
// ---------------------------------------------------------------------------
export async function chatWithInvestigatorAssistant(params: {
  caseInfo: MysteryCase;
  documents: EvidenceDoc[];
  suspects: Suspect[];
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userQuery: string;
}) {
  const { caseInfo, documents, suspects, chatHistory, userQuery } = params;
  const ai = getGeminiClient();

  const docCorpus = (documents || [])
    .map(
      (d) =>
        `--- [${d.docNumber}: ${d.title}] (${d.type}) ---\nSource: ${d.source}\nDate/Time: ${d.dateOrTime}\nContent:\n${d.content}\n`
    )
    .join('\n\n');

  const suspectCorpus = (suspects || [])
    .map(
      (s) =>
        `SUSPECT: ${s.name} (${s.role})
- Relationship / Status: ${s.status === 'prime_suspect' ? 'Prime Suspect' : s.status === 'cleared' ? 'Cleared Witness' : 'Person of Interest'}
- Check-In Time: ${s.checkInTime || 'Unrecorded'}
- Check-Out Time: ${s.checkOutTime || 'Unrecorded'}
- Visited Venue / Location: ${caseInfo.crimeScene}
- Investigative Guidelines: ${s.guidelines || 'Examine access timestamps against logs'}
- Claimed Alibi: ${s.alibi}
- Alleged Motive: ${s.motive}
- Opportunity: ${s.opportunity}
- Known Claims: ${(s.claims || []).map((c) => `[${c.type.toUpperCase()}] "${c.claim}" (Ref: ${c.sourceDocNumber || 'N/A'})`).join('; ')}`
    )
    .join('\n\n');

  const systemInstruction = `You are "Myri AI Sherlock", an elite Chief Forensic Detective assisting an investigator solving: "${caseInfo.title}".
Case Dossier:
- Case Title: ${caseInfo.title}
- Crime Scene & Visited Venue: ${caseInfo.crimeScene}
- Incident Time Window: ${caseInfo.timeOfCrime}
- Target / Stolen Asset / Victim: ${caseInfo.victimOrTarget}
- Summary: ${caseInfo.summary}

AVAILABLE EVIDENCE DOCUMENTS:
${docCorpus}

SUSPECT DOSSIERS & ACCESS TIMESTAMPS:
${suspectCorpus}

CRITICAL INVESTIGATION INSTRUCTIONS:
1. COMPLETE CASE REPORT:
   When asked to "tell complete report about the case", "case report", "full report", "give complete report", or similar:
   You MUST generate a comprehensive 5-part Forensic Case Report:
   - SECTION 1: INCIDENT BRIEFING (Crime scene, time window, lost asset, background).
   - SECTION 2: SUSPECT MATRIX & RELATIONSHIPS (List EVERY suspect with: Name, Role, Relationship, Check-In Time, Check-Out Time, Visited Location, and Claimed Alibi).
   - SECTION 3: TIMELINE & TELEMETRY AUDIT (Compare check-in and check-out times against official keycard/CCTV access logs [DOC-01]).
   - SECTION 4: CONTRADICTIONS & PHYSICAL EVIDENCE (Highlight who lied, Wi-Fi IP logs, and eyewitness reports).
   - SECTION 5: FINAL INVESTIGATIVE CONCLUSION (Identify the prime culprit and provide forensic justification).

2. PERSON / SUSPECT INQUIRIES (e.g. "Who is Ram?", "Who is Santosh?", "Who is Maya?", "Who is Michael?", etc.):
   Whenever asked about any person or suspect:
   - Identify their Name & Official Role.
   - Explain their Relationship to the victim, organization, or other suspects.
   - State their exact Visited Location, Check-In Time, and Check-Out Time.
   - Contrast their Claimed Alibi against official electronic logs [DOC-01] and exhibit documents.
   - If the person asked about is NOT on the active roster for this case (e.g. Ram, Santosh, Michael):
     Clearly state that they are not on the active roster for "${caseInfo.title}", list the actual suspects on file with their relationships and Check-In/Check-Out times, and note how to add them if they are an uncatalogued accomplice or from a custom case.

3. STRICT CITATIONS: Always cite official evidence documents like [DOC-01], [DOC-02] when referencing facts, timestamps, or witness statements.

4. NO VAGUE DEFLECTIONS: Never respond with a generic "how can I help you" when the user asked a factual question about the case or a person! Respond immediately with structured, forensic analysis.`;

  // Fallback response engine
  const getFallbackChat = () => {
    const lowerQ = userQuery.toLowerCase();
    let responseText = '';
    const citations: string[] = [];

    // Helper: Build complete report for the case
    const buildCompleteCaseReport = () => {
      const suspectLines = (suspects || []).map((s) => (
        `• **${s.name}** (${s.role})\n` +
        `  - **Relationship**: ${s.status === 'prime_suspect' ? 'Primary Person of Interest' : 'Key Associate / Witness'} linked to ${caseInfo.victimOrTarget}\n` +
        `  - **Visited Venue**: ${caseInfo.crimeScene}\n` +
        `  - **Check-In Time**: ${s.checkInTime || 'Recorded on-site'}\n` +
        `  - **Check-Out Time**: ${s.checkOutTime || 'Recorded on-site'}\n` +
        `  - **Claimed Alibi**: "${s.alibi}"\n` +
        `  - **Guidelines / Notes**: ${s.guidelines || 'Verify badge logs'}\n`
      )).join('\n');

      return `============================================================\n` +
        `           MYRI AI FORENSIC CASE STUDY REPORT\n` +
        `============================================================\n\n` +
        `### **1. INCIDENT BRIEFING**\n` +
        `• **Case Title**: ${caseInfo.title}\n` +
        `• **Crime Scene & Location Visited**: ${caseInfo.crimeScene}\n` +
        `• **Incident Time Window**: ${caseInfo.timeOfCrime}\n` +
        `• **Target / Stolen Asset**: ${caseInfo.victimOrTarget}\n` +
        `• **Summary**: ${caseInfo.summary}\n\n` +
        `### **2. SUSPECT MATRIX, RELATIONSHIPS & TIMESTAMPS**\n` +
        `${suspectLines}\n` +
        `### **3. TIMELINE & ACCESS LOG AUDIT [DOC-01]**\n` +
        `• Keycard and electronic telemetry recorded in **[DOC-01]** tracks all entries and exits during the incident window.\n` +
        `• Access logs prove who actually stepped into the perimeter versus who only claimed an off-site alibi.\n\n` +
        `### **4. PRIMARY CONTRADICTIONS & EXHIBITS**\n` +
        `• Cross-referencing **[DOC-01]** (Access Logs) with **[DOC-02]** (Witness Depositions) reveals a critical timeline discrepancy where the primary suspect claimed to be elsewhere, but digital records prove physical presence.\n` +
        `• Supporting exhibits **[DOC-03]** and **[DOC-04]** corroborate the motive and recovery of key evidence.\n\n` +
        `### **5. FORENSIC VERDICT**\n` +
        `• The evidence points definitively to the suspect whose digital keycard and Wi-Fi footprint shattered their alibi.\n` +
        `• Recommended Action: Proceed with formal indictment in the **Solve Case** console.`;
    };

    // 1. Check if user requested a Complete Case Report
    if (
      lowerQ.includes('report') || 
      lowerQ.includes('complete') || 
      lowerQ.includes('summary') || 
      lowerQ.includes('case details') || 
      lowerQ.includes('full case')
    ) {
      return {
        content: buildCompleteCaseReport(),
        citations: ['DOC-01', 'DOC-02', 'DOC-03', 'DOC-04'],
        suggestedPrompts: [
          'Who is lying about their check-in time?',
          'Compare access logs against witness statements',
          'Who had both motive and opportunity?',
        ],
      };
    }

    // 2. Check if user is asking about an individual suspect by name
    const matchedSuspect = (suspects || []).find((s) => {
      const sName = s.name.toLowerCase();
      if (lowerQ.includes(sName)) return true;
      const parts = sName.split(' ');
      return parts.some((p) => p.length > 2 && lowerQ.includes(p));
    });

    if (matchedSuspect) {
      responseText = `### **Forensic Subject Dossier: ${matchedSuspect.name}**\n\n` +
        `• **Role & Position**: ${matchedSuspect.role}\n` +
        `• **Relationship**: Key associate linked to **${caseInfo.victimOrTarget}** at **${caseInfo.crimeScene}**\n` +
        `• **Visited Location**: ${caseInfo.crimeScene}\n` +
        `• **Check-In Time**: **${matchedSuspect.checkInTime || 'Unrecorded'}**\n` +
        `• **Check-Out Time**: **${matchedSuspect.checkOutTime || 'Unrecorded'}**\n` +
        `• **Claimed Alibi**: "${matchedSuspect.alibi}"\n` +
        `• **Alleged Motive**: ${matchedSuspect.motive}\n` +
        `• **Opportunity**: ${matchedSuspect.opportunity}\n` +
        `• **Investigative Guidelines**: ${matchedSuspect.guidelines || 'Verify badge logs and CCTV feeds'}\n\n` +
        `### **Forensic Analysis vs Evidence**:\n` +
        (matchedSuspect.status === 'prime_suspect' || matchedSuspect.isCulprit
          ? `⚠️ **CONTRADICTION DETECTED**: Electronic telemetry in **[DOC-01]** and **[DOC-02]** refutes their claimed alibi. Digital records confirm their presence at the scene during the critical window (${caseInfo.timeOfCrime})!\n`
          : `✓ **ALIBI VERIFIED**: Corroborating documents in **[DOC-01]** and eyewitness reports confirm their location away from the crime scene.\n`);

      citations.push('DOC-01', 'DOC-02');
      return { content: responseText, citations };
    }

    // 3. Handle inquiries for unknown names (e.g. Ram, Santosh, Michael, John, etc.)
    const checkUnknownPerson = () => {
      const knownInquiryTokens = ['ram', 'santosh', 'michael', 'raj', 'kumar', 'vikram', 'sharma', 'patel', 'john', 'david'];
      const matchedToken = knownInquiryTokens.find((t) => lowerQ.includes(t)) || 
        (lowerQ.match(/who is ([a-z]+)/i) ? lowerQ.match(/who is ([a-z]+)/i)![1] : null);

      if (matchedToken) {
        const capitalName = matchedToken.charAt(0).toUpperCase() + matchedToken.slice(1);
        const suspectRosterText = (suspects || []).map((s) => (
          `• **${s.name}** (${s.role})\n` +
          `  - **Relationship**: Associate at ${caseInfo.crimeScene}\n` +
          `  - **Visited Location**: ${caseInfo.crimeScene}\n` +
          `  - **Check-In**: ${s.checkInTime || 'N/A'} | **Check-Out**: ${s.checkOutTime || 'N/A'}\n` +
          `  - **Alibi**: "${s.alibi}"\n`
        )).join('\n');

        return `### **Inquiry Concerning: ${capitalName}**\n\n` +
          `Detective, I cross-referenced the personnel database, visitor logs, and keycard telemetry for **"${caseInfo.title}"**:\n\n` +
          `• **Roster Status**: There is **no registered suspect or employee named "${capitalName}"** in the active case file.\n` +
          `• **Crime Scene Presence**: Checking the access logs in **[DOC-01]** for the incident window (**${caseInfo.timeOfCrime}**), no keycard or visitor pass assigned to "${capitalName}" entered **${caseInfo.crimeScene}**.\n\n` +
          `### **Active Suspect Matrix (Relationships & Check-In/Check-Out Times)**:\n` +
          `${suspectRosterText}\n` +
          `• **Investigator Directive**: If **${capitalName}** is an uncatalogued accomplice or from your custom mystery case, check the visitor log in **[DOC-01]** or click **"+ Add Case"** to create a custom case featuring ${capitalName} with custom Check-In/Check-Out times and guidelines!`;
      }
      return null;
    };

    const unknownPersonResponse = checkUnknownPerson();
    if (unknownPersonResponse) {
      citations.push('DOC-01', 'DOC-02');
      return { content: unknownPersonResponse, citations };
    }

    // Default case-specific deep fallbacks
    if (caseInfo.id === 'case-missing-laptop') {
      responseText = `Investigator, take a close look at **Maya Chen's** claims versus the electronic telemetry:\n\n` +
        `• **Subject**: Maya Chen (Executive Assistant to CEO)\n` +
        `• **Check-In Time**: **09:55 PM (21:55:18)** | **Check-Out Time**: **10:28 PM (22:28:01)**\n` +
        `• **Visited Location**: Penthouse Service Corridor & Suite 402\n` +
        `• **Contradiction #1**: In **[DOC-02]**, Maya swears she left the building at 9:00 PM for dinner in SoMa. Yet the automated building access log **[DOC-01]** records her keycard swiping into the Penthouse Service Corridor at **21:55:18**.\n\n` +
        `• **Contradiction #2**: In **[DOC-03]**, Alex Rivera asks about cables. Maya claims to be out at dinner, yet Slack internal telemetry tracks her IP as **10.240.14.88**—the executive boardroom Wi-Fi access point!\n\n` +
        `• **Eyewitness Corroboration**: In **[DOC-05]**, Sam Patel caught Maya in the service stairwell at 22:10 carrying a large tote bag, and **[DOC-01]** logs an exit through the South Fire Door at 22:28:01.\n\n` +
        `The evidence overwhelmingly refutes Maya's alibi.`;
      citations.push('DOC-01', 'DOC-02', 'DOC-03', 'DOC-05');
    } else if (caseInfo.id === 'case-corporate-leak') {
      responseText = `Scrutinizing **Marcus Brody's** movements:\n\n` +
        `• **Subject**: Marcus Brody (VP of Business Development)\n` +
        `• **Check-In Time**: **01:10 AM (01:10:22)** | **Check-Out Time**: **01:49 AM (01:49:05)**\n` +
        `• **Visited Location**: Executive Underground Garage & Server Closet B\n` +
        `• **Contradiction**: In **[DOC-06]**, Brody swears he was drinking at the Ritz-Carlton until 01:30 AM and never set foot in Vanguard HQ. However, **[DOC-04]** confirms his badge swiped the garage entrance at **01:10 AM** and his car departed at **01:49 AM**.\n\n` +
        `• In **[DOC-03]**, his recovered encrypted email confirms a $2.2M USDC escrow for pre-patent genetic blueprints with a Zurich contact.\n` +
        `• In **[DOC-05]**, Head of IT Chloe Dupont discovered a Raspberry Pi dongle on Port 12 in Server Closet B that spoofed Dr. Elena Rostova's workstation IP (**[DOC-01]**).\n\n` +
        `Marcus Brody intentionally framed Dr. Rostova.`;
      citations.push('DOC-01', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-06');
    } else {
      responseText = `Examining the **Obsidian Gallery Heist**:\n\n` +
        `• **Subject**: Beatrice Fontaine (Head Curator)\n` +
        `• **Check-In Time**: **02:45 PM (Calibration) & 08:30 PM (Gala)** | **Check-Out**: **10:15 PM (Airport Attempt)**\n` +
        `• **Visited Location**: Grand Vitrine Display Chamber\n` +
        `• **Contradiction**: Beatrice claims the sapphire vanished during the 4-minute blackout (**[DOC-03]**). Yet the SCADA telemetry in **[DOC-01]** and weight metrics in **[DOC-02]** reveal that Titan-Shield laser backup batteries kept the laser array 100% powered, and the weight on the pedestal NEVER deviated from **142.60 grams**.\n` +
        `• GIA laboratory spectroscopy in **[DOC-04]** proved the stone on the pedestal was a synthetic replica fabricated by Julian Moreau (**[DOC-05]**).\n` +
        `• Beatrice made the swap at 3:00 PM during private calibration (**[DOC-06]**), and was detained at JFK Airport with the real gem in her shoe heel (**[DOC-07]**).`;
      citations.push('DOC-01', 'DOC-02', 'DOC-03', 'DOC-04', 'DOC-05', 'DOC-07');
    }

    return {
      content: responseText,
      citations,
      suggestedPrompts: [
        'Tell complete report about the case',
        'Show all suspect check-in and check-out times',
        'Who is lying about their alibi?',
      ],
    };
  };

  if (!ai) return getFallbackChat();

  try {
    const historyText = chatHistory
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'Investigator' : 'Sherlock AI'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${systemInstruction}

CONVERSATION CONTEXT:
${historyText}

INVESTIGATOR QUESTION:
${userQuery}

Respond directly as Sherlock AI with sharp detective deduction, bullet points, and mandatory bracketed citations like [DOC-01].`;

    const raw = await callGeminiCascade(ai, fullPrompt);
    if (!raw) return getFallbackChat();

    const matchedCitations = Array.from(
      new Set(raw.match(/\[DOC-\d+\]/g)?.map((c) => c.replace(/[\[\]]/g, '')) || [])
    );

    return {
      content: raw,
      citations: matchedCitations.length > 0 ? matchedCitations : ['DOC-01', 'DOC-02'],
      suggestedPrompts: [
        'Who has the weakest alibi?',
        'Show all access badge timestamps',
        'What physical evidence proves guilt?',
      ],
    };
  } catch (error) {
    console.error('Gemini chat error, using fallback:', error);
    return getFallbackChat();
  }
}

// ---------------------------------------------------------------------------
// 3. Final Report Generator
// ---------------------------------------------------------------------------
export async function generateFinalInvestigationReport(params: {
  caseInfo: MysteryCase;
  accusedSuspect: Suspect;
  allSuspects: Suspect[];
  documents: EvidenceDoc[];
  investigatorNotes?: string;
  confidenceRating: number;
}): Promise<FinalReport> {
  const { caseInfo, accusedSuspect, allSuspects, documents, investigatorNotes, confidenceRating } = params;
  const isCorrect = accusedSuspect.id === caseInfo.culpritId;

  const accuracyScore = isCorrect
    ? Math.min(100, Math.max(88, Math.round(confidenceRating * 0.95 + 10)))
    : Math.max(15, Math.round((100 - confidenceRating) * 0.35));

  const grade = isCorrect
    ? accuracyScore >= 95
      ? 'S - Master Sleuth'
      : accuracyScore >= 85
      ? 'A - Senior Inspector'
      : 'B - Detective Grade II'
    : 'F - Misdirected Accusation';

  // Reliable, comprehensive fallback report
  const fallbackReport: FinalReport = {
    id: `rep-${Date.now()}`,
    caseId: caseInfo.id,
    accusedSuspectId: accusedSuspect.id,
    accusedSuspectName: accusedSuspect.name,
    verdict: isCorrect ? 'SOLVED' : 'MISDIRECTION',
    accuracyScore,
    confidenceRating,
    executiveSummary: isCorrect
      ? `OFFICIAL INDICTMENT: The investigation into "${caseInfo.title}" concludes with the definitive indictment of ${accusedSuspect.name} (${accusedSuspect.role}). The prosecution is grounded upon indisputable forensic telemetry, electronic alibi contradictions, and direct physical evidence recovery.`
      : `CASE FLAGGED - FALSE ACCUSATION: The prosecution of ${accusedSuspect.name} is contradicted by verified physical alibis. The actual culprit managed to deflect scrutiny onto this suspect through deliberate misdirection.`,
    evidenceTrail: isCorrect
      ? [
          'Sworn alibi directly contradicted by building keycard swipe logs at the critical hour.',
          'Local network telemetry proves physical presence at the crime scene during the theft window.',
          'Eyewitness encounter confirms suspect leaving via emergency exit carrying stolen goods.',
          'Financial records and recovered cryptographic bypass tools establish undisputed guilt.',
        ]
      : [
          'Suspect possessed verifiable digital and physical alibis for the critical window.',
          'Attributed indicators were planted or spoofed by another party to misdirect the investigation.',
          'Lack of opportunity or physical access during the incident window.',
        ],
    contradictionBreakdown: isCorrect
      ? [
          'Claimed departure contradicted by electronic badge swipe.',
          'Claimed cellular connection contradicted by local boardroom Wi-Fi association.',
        ]
      : [
          'Target was framed through forged or borrowed credentials.',
        ],
    motiveBreakdown: isCorrect
      ? accusedSuspect.motive
      : `While ${accusedSuspect.name} had superficial friction, they lacked the execution capability demonstrated in the incident.`,
    aiDetectiveGrade: grade,
    timestamp: new Date().toISOString(),
  };

  const ai = getGeminiClient();
  if (!ai) return fallbackReport;

  const prompt = `You are the Supreme Magistrate and Chief Forensic Evaluator.
Generate an Official Investigation Case Report evaluating an investigator's accusation.
Return a valid JSON object with exact fields:
- "executiveSummary": string (paragraph explaining the verdict)
- "evidenceTrail": string[] (3-4 bullet points outlining key evidence steps)
- "contradictionBreakdown": string[] (1-3 contradictions uncovered)
- "motiveBreakdown": string (analysis of motive)

Case: ${caseInfo.title}
True Culprit ID: ${caseInfo.culpritId}
Accused Suspect: ${accusedSuspect.name} (${accusedSuspect.role}, ID: ${accusedSuspect.id})
Is Accusation Correct: ${isCorrect ? 'YES - TRUE CULPRIT' : 'NO - WRONG SUSPECT ACCUSED'}
Suspect Motive: ${accusedSuspect.motive}
Suspect Alibi: ${accusedSuspect.alibi}
Guilt Explanation from Case File: ${accusedSuspect.guiltExplanation}
Investigator Notes: ${investigatorNotes || 'Evidence synthesis'}

If correct, celebrate the investigator's sharp deduction and outline the concrete proof. If incorrect, explain why this suspect is innocent and where the investigator was misled.`;

  try {
    const raw = await callGeminiCascade(ai, prompt, { responseMimeType: 'application/json' });
    if (!raw) return fallbackReport;

    const parsed = parseSafeJson<any>(raw, null);
    if (!parsed) return fallbackReport;

    return {
      id: `rep-${Date.now()}`,
      caseId: caseInfo.id,
      accusedSuspectId: accusedSuspect.id,
      accusedSuspectName: accusedSuspect.name,
      verdict: isCorrect ? 'SOLVED' : 'MISDIRECTION',
      accuracyScore,
      confidenceRating,
      executiveSummary: parsed.executiveSummary || fallbackReport.executiveSummary,
      evidenceTrail: parsed.evidenceTrail || fallbackReport.evidenceTrail,
      contradictionBreakdown: parsed.contradictionBreakdown || fallbackReport.contradictionBreakdown,
      motiveBreakdown: parsed.motiveBreakdown || fallbackReport.motiveBreakdown,
      aiDetectiveGrade: grade,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gemini report generation error, using fallback:', error);
    return fallbackReport;
  }
}
