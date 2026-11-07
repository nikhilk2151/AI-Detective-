import { NextResponse } from 'next/server';
import { getAdminFirestore, isFirebaseAdminConfigured } from '@/lib/firebase/admin';

// In-memory text reports cache for free-tier resilience
let inMemoryReports: any[] = [];

export async function POST(req: Request) {
  try {
    const reportData = await req.json();

    if (!reportData || !reportData.id || !reportData.fullReportText) {
      return NextResponse.json({ error: 'Missing reportId or text content' }, { status: 400 });
    }

    const payload = {
      ...reportData,
      format: 'text/plain',
      storedAt: new Date().toISOString(),
    };

    // 1. Always update memory cache
    inMemoryReports = [payload, ...inMemoryReports.filter(r => r.id !== payload.id)];

    // 2. Persist to Firestore Admin if configured
    const firestore = getAdminFirestore();
    let firestorePersisted = false;

    if (firestore && isFirebaseAdminConfigured) {
      try {
        await firestore.collection('case_study_reports').doc(payload.id).set(payload, { merge: true });
        firestorePersisted = true;
      } catch (err) {
        console.warn('Firestore Admin write notice:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Case study report stored in text format successfully',
      reportId: payload.id,
      firestorePersisted,
      format: 'text/plain',
    });
  } catch (error: any) {
    console.error('Error saving text report:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    const firestore = getAdminFirestore();
    if (firestore && isFirebaseAdminConfigured) {
      try {
        let q = firestore.collection('case_study_reports');
        let snapshot;
        if (caseId) {
          snapshot = await q.where('caseId', '==', caseId).get();
        } else {
          snapshot = await q.get();
        }

        const reports = snapshot.docs.map(doc => doc.data());
        if (reports.length > 0) {
          return NextResponse.json({ reports, source: 'firestore' });
        }
      } catch (err) {
        console.warn('Firestore fetch notice:', err);
      }
    }

    const filtered = caseId ? inMemoryReports.filter(r => r.caseId === caseId) : inMemoryReports;
    return NextResponse.json({ reports: filtered, source: 'cache' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

