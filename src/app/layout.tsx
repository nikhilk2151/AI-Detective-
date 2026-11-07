import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CaseProvider } from '@/context/CaseContext';

export const metadata: Metadata = {
  title: 'AI Detective: Mystery Solver',
  description: 'Evidence-Grounded Criminal Investigation Dashboard powered by Google Gemini and Firebase',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-detective-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-detective-950">
        <AuthProvider>
          <CaseProvider>
            {children}
          </CaseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

