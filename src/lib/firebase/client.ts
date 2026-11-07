import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  type Firestore 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCEtcpymA0mr42v24tvqz3KbbzN6f5sOqw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ai-mystery-solver.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ai-mystery-solver',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ai-mystery-solver.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '902204885458',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:902204885458:web:3c5e896505b231d442600b',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_firebase_api_key' && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'your_project_id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase client initialization warning:', err);
  }
}

export { 
  app, 
  auth, 
  db, 
  firebaseConfig,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  fbSignOut, 
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  type User 
};
