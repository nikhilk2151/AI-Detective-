import { NextResponse } from 'next/server';
import { extractEntitiesWithGemini } from '@/lib/gemini/client';
import { EvidenceDoc } from '@/types/detective';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doc = body.doc as EvidenceDoc;

    if (!doc || !doc.content) {
      return NextResponse.json({ error: 'Missing document or document content.' }, { status: 400 });
    }

    const result = await extractEntitiesWithGemini(doc);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/gemini/extract-entities:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

