'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  fbSignOut, 
  onAuthStateChanged,
  isFirebaseConfigured,
  type User 
} from '@/lib/firebase/client';

export interface InvestigatorProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  badgeNumber: string;
  rank: 'Lead Investigator' | 'Detective Inspector' | 'Forensic Sleuth' | 'Guest Detective';
  isGuest: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: InvestigatorProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (customName?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'ai_detective_guest_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InvestigatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if Firebase Auth is available
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
        if (fbUser) {
          const photo = fbUser.photoURL || fbUser.providerData?.[0]?.photoURL || undefined;
          const name = fbUser.displayName || fbUser.providerData?.[0]?.displayName || fbUser.email?.split('@')[0] || 'Investigator';
          
          const profile: InvestigatorProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: name,
            badgeNumber: `BADGE-${fbUser.uid.slice(0, 6).toUpperCase()}`,
            rank: 'Detective Inspector',
            isGuest: false,
            avatarUrl: photo,
          };

          try {
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile));
          } catch {}

          setUser(profile);
          setLoading(false);
        } else {
          // Check for existing guest session
          checkGuestSession();
        }
      });
      return () => unsubscribe();
    } else {
      // Firebase not configured, check guest storage
      checkGuestSession();
    }
  }, []);

  const checkGuestSession = () => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // No active session: keep user as null so Google Sign-In prompt is offered on first visit
        setUser(null);
      }
    } catch {
      // In SSR or restricted storage
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      // Simulate login for guest/local
      const guestProfile: InvestigatorProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        badgeNumber: `NYPD-${Math.floor(1000 + Math.random() * 9000)}`,
        rank: 'Forensic Sleuth',
        isGuest: true,
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
      setUser(guestProfile);
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (!isFirebaseConfigured || !auth) {
      const guestProfile: InvestigatorProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: name || email.split('@')[0],
        badgeNumber: `FBI-${Math.floor(1000 + Math.random() * 9000)}`,
        rank: 'Detective Inspector',
        isGuest: true,
      };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
      setUser(guestProfile);
      return;
    }
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      const guestProfile: InvestigatorProfile = {
        uid: `google-${Date.now()}`,
        email: 'agent.google@detective.org',
        displayName: 'Special Agent V',
        badgeNumber: 'CID-8821',
        rank: 'Lead Investigator',
        isGuest: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
      } catch {}
      setUser(guestProfile);
      return;
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    if (res?.user) {
      const fbUser = res.user;
      const photo = fbUser.photoURL || fbUser.providerData?.[0]?.photoURL || undefined;
      const name = fbUser.displayName || fbUser.providerData?.[0]?.displayName || fbUser.email?.split('@')[0] || 'Investigator';
      
      const profile: InvestigatorProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: name,
        badgeNumber: `BADGE-${fbUser.uid.slice(0, 6).toUpperCase()}`,
        rank: 'Detective Inspector',
        isGuest: false,
        avatarUrl: photo,
      };
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile));
      } catch {}
      setUser(profile);
    }
  };

  const signInAsGuest = (customName?: string) => {
    const guestProfile: InvestigatorProfile = {
      uid: `guest-${Date.now()}`,
      email: null,
      displayName: customName || 'Consulting Detective',
      badgeNumber: `SCOT-${Math.floor(1000 + Math.random() * 9000)}`,
      rank: 'Guest Detective',
      isGuest: true,
    };
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
    } catch {}
    setUser(guestProfile);
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

