import { NextResponse } from 'next/server';
import { chatWithInvestigatorAssistant } from '@/lib/gemini/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caseInfo, documents, suspects, chatHistory, userQuery } = body;

    if (!caseInfo || !userQuery) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const result = await chatWithInvestigatorAssistant({
      caseInfo,
      documents: documents || [],
      suspects: suspects || [],
      chatHistory: chatHistory || [],
      userQuery,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/gemini/investigate-chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

