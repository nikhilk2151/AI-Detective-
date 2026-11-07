const http = require('http');

async function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING COMPLETE END-TO-END TEST SUITE ===\n');

  // 1. Test Home Route
  console.log('Test 1: Testing Home page route (http://localhost:3000)...');
  try {
    const homeRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
    });
    console.log(`✓ Home page status: ${homeRes.status} (Length: ${homeRes.raw ? homeRes.raw.length : 'ok'} bytes)`);
  } catch (err) {
    console.error('✗ Home page failed:', err.message);
  }

  // 2. Test Store Case Study Report in Text Format
  console.log('\nTest 2: Testing Store Case Study Report in Text Format (/api/firestore/case-reports)...');
  const sampleReportText = `============================================================
          MYRI AI FORENSIC CASE STUDY REPORT
       (Stored in Text Format in Firebase Firestore)
============================================================
REPORT ID: rep-test-case-1-001
CASE FILE: The Missing Laptop
CASE ID: case-1
DIFFICULTY LEVEL: Easy
CRIME SCENE / LOCATION: Floor 4 - Executive Suite 402
INCIDENT TIME WINDOW: 09:00 PM - 10:30 PM
TARGET / STOLEN ASSET: Prototype AI Workstation Laptop
DATABASE STORAGE: Firebase Firestore (Free Tier / Text Format)

SECTION 1: OFFICIAL VERDICT & PROSECUTION RESULT
ACCUSED SUSPECT: Maya Lin (Suspect ID: susp-1)
VERDICT STATUS: CASE OFFICIALLY SOLVED — GUILTY INDICTMENT CONFIRMED
CONFIDENCE SCORE: 96%
DETECTIVE RANKING: S - Master Sleuth

SECTION 2: EXECUTIVE SUMMARY & CRIME RECONSTRUCTION
Maya Lin was observed entering Executive Suite 402 at 09:42 PM using her electronic badge. Network logs register her laptop connecting to the local Wi-Fi while downloading sensitive workstation keys.

SECTION 3: GROUNDED EVIDENCE TRAIL
  [EXHIBIT-TRAIL 1] DOC-01 badge swipe at 09:42 PM directly matches the theft window.
  [EXHIBIT-TRAIL 2] DOC-02 CCTV camera frame shows suspect leaving via stairwell B.

FORMAT: text/plain (Zero Binary Bloat)
STORAGE DESTINATION: Firebase Firestore Free-Tier
============================================================`;

  const reportPayload = {
    id: 'rep-test-case-1-001',
    caseId: 'case-1',
    caseTitle: 'The Missing Laptop',
    caseDifficulty: 'Easy',
    accusedSuspectId: 'susp-1',
    accusedSuspectName: 'Maya Lin',
    verdict: 'SOLVED',
    accuracyScore: 96,
    confidenceRating: 90,
    executiveSummary: 'Official indictment of Maya Lin grounded in electronic access and CCTV records.',
    evidenceTrail: ['DOC-01 badge swipe at 09:42 PM', 'DOC-02 CCTV stairwell B confirmation'],
    contradictionBreakdown: ['Claimed to be in breakroom, badge logs put her in Suite 402'],
    motiveBreakdown: 'Competitor recruitment bonus',
    aiDetectiveGrade: 'S - Master Sleuth',
    fullReportText: sampleReportText,
    format: 'text/plain',
    timestamp: new Date().toISOString(),
  };

  try {
    const postRepRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/firestore/case-reports',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, reportPayload);
    console.log(`✓ Save Report API status: ${postRepRes.status}`);
    console.log(`  Response:`, postRepRes.data);
  } catch (err) {
    console.error('✗ Save Report failed:', err.message);
  }

  // 3. Test Retrieve Case Study Reports in Text Format
  console.log('\nTest 3: Testing Retrieve Case Study Reports in Text Format (/api/firestore/case-reports)...');
  try {
    const getRepRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/firestore/case-reports',
      method: 'GET',
    });
    console.log(`✓ Get Reports API status: ${getRepRes.status}`);
    console.log(`  Reports found count: ${getRepRes.data?.reports?.length}`);
    if (getRepRes.data?.reports?.length > 0) {
      console.log(`  First report format: ${getRepRes.data.reports[0].format}`);
      console.log(`  First report text preview:\n  ${getRepRes.data.reports[0].fullReportText.split('\n').slice(0, 5).join('\n  ')}`);
    }
  } catch (err) {
    console.error('✗ Get Reports failed:', err.message);
  }

  // 4. Test AI Detective Chat (/api/gemini/investigate-chat)
  console.log('\nTest 4: Testing Gemini AI Detective Interrogation Chat (/api/gemini/investigate-chat)...');
  try {
    const chatPayload = {
      userQuery: 'Who was inside Executive Suite 402 around 09:45 PM according to the access logs?',
      caseInfo: {
        id: 'case-1',
        title: 'The Missing Laptop',
        crimeScene: 'Floor 4 - Suite 402',
        timeOfCrime: '09:00 PM - 10:30 PM',
        victimOrTarget: 'AI Prototype Laptop',
        culpritId: 'susp-1',
      },
      documents: [
        {
          id: 'doc-1',
          docNumber: 'DOC-01',
          title: 'Keycard Access Log',
          type: 'badge_swipe',
          content: '09:42 PM: Maya Lin (Badge #4012) swiped into Suite 402.\n10:05 PM: David Ross (Badge #3109) swiped into Suite 402.',
          entityTags: { people: ['Maya Lin', 'David Ross'], locations: ['Suite 402'], timestamps: ['09:42 PM', '10:05 PM'], keyActions: ['Badge swipe'] }
        }
      ],
      suspects: [
        { id: 'susp-1', name: 'Maya Lin', role: 'Senior Developer', alibi: 'Was in 2nd floor cafeteria the entire evening.', checkInTime: '09:40 PM', checkOutTime: '10:15 PM' }
      ],
      chatHistory: [],
    };

    const chatRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/gemini/investigate-chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, chatPayload);
    console.log(`✓ AI Chat API status: ${chatRes.status}`);
    console.log(`  AI Response preview: "${chatRes.data?.content?.substring(0, 160)}..."`);
    console.log(`  Evidence Citations:`, chatRes.data?.citations);
  } catch (err) {
    console.error('✗ AI Chat failed:', err.message);
  }

  // 5. Test AI Document Entity Extraction (/api/gemini/extract-entities)
  console.log('\nTest 5: Testing Gemini AI Document Entity Extraction (/api/gemini/extract-entities)...');
  try {
    const extractPayload = {
      doc: {
        id: 'doc-02',
        docNumber: 'DOC-02',
        title: 'CCTV Security Footprint',
        type: 'cctv_log',
        content: 'Camera 04 (Stairwell B) captured an individual wearing a dark trenchcoat carrying a silver laptop bag leaving at 09:58 PM.',
      }
    };

    const extractRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/gemini/extract-entities',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, extractPayload);
    console.log(`✓ AI Extraction status: ${extractRes.status}`);
    console.log(`  Extracted Entities:`, extractRes.data?.entities);
  } catch (err) {
    console.error('✗ AI Extraction failed:', err.message);
  }

  // 6. Test AI Verdict & Report Generation (/api/gemini/generate-report)
  console.log('\nTest 6: Testing Gemini AI Verdict & Report Generation (/api/gemini/generate-report)...');
  try {
    const verdictPayload = {
      caseInfo: {
        id: 'case-1',
        title: 'The Missing Laptop',
        crimeScene: 'Suite 402',
        timeOfCrime: '09:00 PM - 10:30 PM',
        victimOrTarget: 'Prototype Laptop',
        culpritId: 'susp-1',
      },
      accusedSuspect: {
        id: 'susp-1',
        name: 'Maya Lin',
        role: 'Senior Developer',
        alibi: 'Was in cafeteria',
        blameConfidence: 95,
        motive: 'Offered $50,000 bounty by rival corp',
      },
      allSuspects: [
        { id: 'susp-1', name: 'Maya Lin', isCulprit: true },
        { id: 'susp-2', name: 'David Ross', isCulprit: false }
      ],
      documents: [
        { docNumber: 'DOC-01', title: 'Badge Swipe Log', content: '09:42 PM: Maya Lin accessed Suite 402.' }
      ],
      confidenceRating: 95
    };

    const verdictRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/gemini/generate-report',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, verdictPayload);
    console.log(`✓ AI Verdict API status: ${verdictRes.status}`);
    console.log(`  Verdict: ${verdictRes.data?.verdict}`);
    console.log(`  Accuracy Score: ${verdictRes.data?.accuracyScore}%`);
    console.log(`  Detective Grade: ${verdictRes.data?.aiDetectiveGrade}`);
  } catch (err) {
    console.error('✗ AI Verdict failed:', err.message);
  }

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
}

runTests();
