import { NextResponse } from 'next/server';
import { generateFinalInvestigationReport } from '@/lib/gemini/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caseInfo, accusedSuspect, allSuspects, documents, investigatorNotes, confidenceRating } = body;

    if (!caseInfo || !accusedSuspect) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const report = await generateFinalInvestigationReport({
      caseInfo,
      accusedSuspect,
      allSuspects: allSuspects || [],
      documents: documents || [],
      investigatorNotes: investigatorNotes || '',
      confidenceRating: typeof confidenceRating === 'number' ? confidenceRating : 85,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-report:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

