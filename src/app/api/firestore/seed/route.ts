import { NextResponse } from 'next/server';
import { getAdminFirestore, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { 
  PRELOADED_CASES, 
  PRELOADED_DOCUMENTS, 
  PRELOADED_SUSPECTS, 
  PRELOADED_TIMELINES, 
  PRELOADED_CONTRADICTIONS 
} from '@/data/mockCases';

export async function POST() {
  try {
    const firestore = getAdminFirestore();

    if (!firestore || !isFirebaseAdminConfigured) {
      return NextResponse.json({
        success: true,
        seededToFirestore: false,
        message: 'Firebase Admin credentials not configured in .env.local. App is functioning with built-in memory/client fallback.',
        casesCount: PRELOADED_CASES.length,
      });
    }

    const batch = firestore.batch();

    // 1. Cases Collection
    for (const c of PRELOADED_CASES) {
      const caseRef = firestore.collection('cases').doc(c.id);
      batch.set(caseRef, c, { merge: true });

      // 2. Evidence Docs Subcollection
      const docs = PRELOADED_DOCUMENTS[c.id] || [];
      for (const d of docs) {
        const docRef = firestore.collection('evidence_docs').doc(d.id);
        batch.set(docRef, d, { merge: true });
      }

      // 3. Suspects Collection
      const suspects = PRELOADED_SUSPECTS[c.id] || [];
      for (const s of suspects) {
        const suspRef = firestore.collection('suspects').doc(s.id);
        batch.set(suspRef, s, { merge: true });
      }

      // 4. Timelines Collection
      const timelines = PRELOADED_TIMELINES[c.id] || [];
      for (const t of timelines) {
        const tlRef = firestore.collection('timelines').doc(t.id);
        batch.set(tlRef, t, { merge: true });
      }

      // 5. Contradictions Collection
      const contradictions = PRELOADED_CONTRADICTIONS[c.id] || [];
      for (const con of contradictions) {
        const conRef = firestore.collection('contradictions').doc(con.id);
        batch.set(conRef, con, { merge: true });
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      seededToFirestore: true,
      message: 'Successfully seeded cases, evidence_docs, suspects, timelines, and contradictions to Firestore!',
      casesCount: PRELOADED_CASES.length,
    });
  } catch (error: any) {
    console.error('Error seeding Firestore:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed Firestore' }, { status: 500 });
  }
}

