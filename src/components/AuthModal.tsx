'use client';

import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Fingerprint, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest, isFirebaseActive } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    signInAsGuest('Detective Cole');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-detective-900 border border-detective-700 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-detective-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glow">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase">
              {isSignUp ? 'Issue Sleuth Credentials' : 'Investigator Terminal Login'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Classified Access Level • Department of Investigation
            </p>
          </div>
        </div>

        {/* Firebase status note */}
        <div className="mb-5 p-3 rounded-xl bg-detective-950 border border-detective-800 flex items-start space-x-2.5 text-xs">
          {isFirebaseActive ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-slate-300">
                Connected to <strong className="text-emerald-400">Firebase Auth & Firestore</strong>.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 text-[11px] leading-relaxed">
                <span>Firebase credentials not yet in <code>.env.local</code>. Running in </span>
                <span className="text-amber-400 font-bold">Local Forensic Sandbox Mode</span>.
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Investigator Name / Alias
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Detective Cole"
                  className="w-full bg-detective-950 border border-detective-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 placeholder-slate-600 font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sleuth@agency.local"
                className="w-full bg-detective-950 border border-detective-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 placeholder-slate-600 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Cipher Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-detective-950 border border-detective-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 placeholder-slate-600 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-detective-950 font-bold rounded-xl text-sm shadow-glow transition-all flex items-center justify-center space-x-2"
          >
            <span>{isSignUp ? 'Register Badge' : 'Authenticate Credentials'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-detective-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-mono">
            <span className="bg-detective-900 px-2 text-slate-500">Or Access Via</span>
          </div>
        </div>

        {/* Social & Guest Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl border border-detective-700 hover:border-slate-500 bg-detective-950 hover:bg-detective-850 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Google Social Auth</span>
          </button>

          <button
            onClick={handleGuest}
            className="w-full py-2 px-4 rounded-xl border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center space-x-2"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Fast-Track: Demo Guest Clearance</span>
          </button>
        </div>

        {/* Toggle Sign Up / Sign In */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isSignUp ? (
            <span>
              Already hold an investigator badge?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-amber-400 hover:underline font-bold"
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              New amateur sleuth?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-amber-400 hover:underline font-bold"
              >
                Request Clearance Badge
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

