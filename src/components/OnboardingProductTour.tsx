'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Compass, 
  FolderSearch, 
  MapPin, 
  Users, 
  FileText, 
  Bot, 
  Gavel, 
  Check, 
  ArrowRight,
  Eye,
  PanelLeftClose,
  PanelRightClose,
  Minimize2,
  Maximize2,
  Crosshair,
  Move,
  GripHorizontal,
  RotateCcw
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  badge: string;
  targetName: string;
  screenLocation: string;
  description: string;
  keyFeatures: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'master-roadmap',
    targetId: 'tour-roadmap-section',
    title: 'Master Investigation Roadmap',
    badge: 'Step 1/7: Roadmap',
    targetName: '4-Step Roadmap Cards',
    screenLocation: 'Center Dashboard',
    description: 'Sabse pehle yeh Roadmap dekhiye. Yeh poore detective platform ka 4-step blueprint hai (Setup, Manage, Find Suspects, Solve).',
    keyFeatures: [
      'Setup & Add Case: Naya mystery case details set karein',
      'Manage Cases: Pre-loaded aur custom cases switch karein',
      'Find Suspects & Spot Lies: Timestamps audit karke jhooth pakdein',
      'Solve with Myri AI: Court-grade report Firestore me save karein'
    ],
    icon: Compass,
  },
  {
    id: 'case-selector',
    targetId: 'tour-case-selector',
    title: 'Archive Dossier Selector',
    badge: 'Step 2/7: Archives',
    targetName: 'Top Case Selector Dropdown',
    screenLocation: 'Top Header Bar',
    description: 'Yahan se aap 3 pre-loaded cases (The Missing Laptop, Corporate Leak, Art Gallery Heist) ya custom cases select kar sakte hain.',
    keyFeatures: [
      '3 Pre-loaded Mysteries (Easy, Twisted, Hard)',
      '1-Click Case Switching with SOLVED status',
      '"+ New" button se naya case create karein'
    ],
    icon: FolderSearch,
  },
  {
    id: 'hero-briefing',
    targetId: 'tour-hero-briefing',
    title: 'Crime Scene & Lost Location',
    badge: 'Step 3/7: Incident Dossier',
    targetName: 'Crime Incident Card',
    screenLocation: 'Hero Dossier Banner',
    description: 'Incident ka core briefing yahan display hota hai: Crime scene location, Incident time window, aur Stolen asset.',
    keyFeatures: [
      'Lost Location: Exact room/vault jahan crime hua',
      'Time Window: Incident timing (e.g. 09:00 PM - 10:30 PM)',
      'Target Asset: Stolen laptop, art ya blueprints'
    ],
    icon: MapPin,
  },
  {
    id: 'suspects',
    targetId: 'tour-suspects-section',
    title: 'Suspect Lineup & Timestamps',
    badge: 'Step 4/7: Suspect Matrix',
    targetName: 'Suspect Profiles Grid',
    screenLocation: 'Suspects Section',
    description: 'Har suspect ke card par unki Check-In/Check-Out entry timing, sworn alibi, aur behavioral guidelines di gayi hain.',
    keyFeatures: [
      'Check-In & Check-Out: Access logs se compare karein',
      'Blame Confidence Slider: Suspects prioritize karein',
      'Accuse This Suspect: 1-click indictment trigger'
    ],
    icon: Users,
  },
  {
    id: 'evidence',
    targetId: 'tour-evidence-section',
    title: 'Physical Exhibits & Documents',
    badge: 'Step 5/7: Exhibits',
    targetName: 'Evidence Documents List',
    screenLocation: 'Evidence Section',
    description: 'Keycard badge logs, CCTV frames, aur witness statements. Gemini AI se structured entity tags extract karein.',
    keyFeatures: [
      'Official Exhibit Documents [DOC-01, DOC-02]',
      'Extract Entities with AI: Auto-parse timestamps & people',
      'Contradiction Feed: Alibi vs logs discrepancy alert'
    ],
    icon: FileText,
  },
  {
    id: 'ai-chat',
    targetId: 'tour-ai-chat-section',
    title: 'Myri AI Forensic Terminal',
    badge: 'Step 6/7: AI Detective',
    targetName: 'Interrogation Terminal',
    screenLocation: 'AI Chat Assistant',
    description: 'Google Gemini se powered AI partner. Sawaal puchhiye aur strict document citations [DOC-01] ke saath jawaab paaiye.',
    keyFeatures: [
      'Strict Document Citations: Proof-grounded answers',
      'Contradiction Detection: Jhoothe alibis expose karta hai',
      'Quick Prompts: 1-click forensic suggestions'
    ],
    icon: Bot,
  },
  {
    id: 'solve-case',
    targetId: 'tour-solve-button',
    title: 'Accuse Culprit & Verdict',
    badge: 'Step 7/7: AI Verdict',
    targetName: 'Solve Case Action Button',
    screenLocation: 'Action Bar & Modal',
    description: 'Chor ko accuse karein. Myri AI accuracy score dega aur official case study report text format me Firebase Firestore me store karega.',
    keyFeatures: [
      'Accuracy Score & Detective Rank (S - Master Sleuth)',
      'Firebase Firestore Free-Tier text storage',
      'View, copy, ya .txt file download karein'
    ],
    icon: Gavel,
  },
];

interface OnboardingProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export default function OnboardingProductTour({
  isOpen,
  onClose,
  onFinish,
}: OnboardingProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Position Management: Drag-and-drop & Double-click relocation
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [cornerAnchor, setCornerAnchor] = useState<'bottom-right' | 'bottom-left' | 'top-left' | 'top-right'>('bottom-right');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [positionToast, setPositionToast] = useState<string | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Directly attach the highlight class to target element in DOM for 100% reliable tracking on ANY device!
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // 1. Remove active class from any existing element
    document.querySelectorAll('.myri-tour-target-active').forEach((node) => {
      node.classList.remove('myri-tour-target-active');
    });

    // 2. Add active class to current target element
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      el.classList.add('myri-tour-target-active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (el) {
        el.classList.remove('myri-tour-target-active');
      }
    };
  }, [isOpen, currentStepIndex, currentStep]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.querySelectorAll('.myri-tour-target-active').forEach((node) => {
        node.classList.remove('myri-tour-target-active');
      });
    };
  }, []);

  // DOUBLE-CLICK ANYWHERE ON SCREEN TO RELOCATE THE TOUR CARD THERE!
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Don't trigger if user was typing in input, clicking buttons, or inside the card itself
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('button'))) {
        return;
      }

      const cardEl = document.getElementById('myri-tour-floating-card');
      if (cardEl && cardEl.contains(target as Node)) {
        return; // Handled separately by header double click
      }

      const cardWidth = cardEl ? cardEl.offsetWidth : 320;
      const cardHeight = cardEl ? cardEl.offsetHeight : 280;

      const newX = Math.max(10, Math.min(e.clientX - cardWidth / 2, window.innerWidth - cardWidth - 10));
      const newY = Math.max(10, Math.min(e.clientY - 20, window.innerHeight - cardHeight - 10));

      setCustomPos({ x: newX, y: newY });
      setPositionToast('📍 Repositioned to clicked spot!');
      const timer = setTimeout(() => setPositionToast(null), 2500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('dblclick', handleWindowDblClick);
    return () => window.removeEventListener('dblclick', handleWindowDblClick);
  }, [isOpen]);

  // MOUSE & TOUCH DRAGGING SYSTEM
  const handleStartDrag = (clientX: number, clientY: number, target: HTMLElement) => {
    if (target.closest('button')) return;
    const cardEl = document.getElementById('myri-tour-floating-card');
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();

    setIsDragging(true);
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStartDrag(e.clientX, e.clientY, e.target as HTMLElement);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cardEl = document.getElementById('myri-tour-floating-card');
      const width = cardEl ? cardEl.offsetWidth : 320;
      const height = cardEl ? cardEl.offsetHeight : 280;

      const newX = Math.max(10, Math.min(e.clientX - dragOffset.x, window.innerWidth - width - 10));
      const newY = Math.max(10, Math.min(e.clientY - dragOffset.y, window.innerHeight - height - 10));

      setCustomPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const cardEl = document.getElementById('myri-tour-floating-card');
        const width = cardEl ? cardEl.offsetWidth : 320;
        const height = cardEl ? cardEl.offsetHeight : 280;

        const newX = Math.max(10, Math.min(touch.clientX - dragOffset.x, window.innerWidth - width - 10));
        const newY = Math.max(10, Math.min(touch.clientY - dragOffset.y, window.innerHeight - height - 10));

        setCustomPos({ x: newX, y: newY });
      }
    };

    const handleEndDrag = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging, dragOffset]);

  // DOUBLE-CLICK ON CARD HEADER CYCLES CORNERS (Bottom-Right -> Bottom-Left -> Top-Left -> Top-Right)
  const handleHeaderDblClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cornerOrder: ('bottom-right' | 'bottom-left' | 'top-left' | 'top-right')[] = [
      'bottom-right',
      'bottom-left',
      'top-left',
      'top-right',
    ];
    const nextIdx = (cornerOrder.indexOf(cornerAnchor) + 1) % cornerOrder.length;
    const nextCorner = cornerOrder[nextIdx];
    setCornerAnchor(nextCorner);
    setCustomPos(null);
    setPositionToast(`📍 Docked to ${nextCorner.replace('-', ' ').toUpperCase()}`);
    const timer = setTimeout(() => setPositionToast(null), 2000);
    return () => clearTimeout(timer);
  };

  const handleResetPosition = () => {
    setCustomPos(null);
    setCornerAnchor('bottom-right');
    setPositionToast('📍 Reset to default bottom-right');
    const timer = setTimeout(() => setPositionToast(null), 2000);
    return () => clearTimeout(timer);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const scrollToTarget = () => {
    if (!currentStep) return;
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('myri_tour_seen', 'true');
    } catch {}
    document.querySelectorAll('.myri-tour-target-active').forEach((node) => {
      node.classList.remove('myri-tour-target-active');
    });
    onClose();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('myri_tour_seen', 'true');
    } catch {}
    document.querySelectorAll('.myri-tour-target-active').forEach((node) => {
      node.classList.remove('myri-tour-target-active');
    });
    onClose();
    if (onFinish) onFinish();
  };

  const StepIcon = currentStep.icon;

  // Corner CSS classes when not using free drag coordinates
  const getCornerClasses = () => {
    switch (cornerAnchor) {
      case 'bottom-left':
        return 'bottom-3 left-3 sm:bottom-5 sm:left-5';
      case 'top-left':
        return 'top-16 left-3 sm:top-20 sm:left-5';
      case 'top-right':
        return 'top-16 right-3 sm:top-20 sm:right-5 sm:left-auto';
      case 'bottom-right':
      default:
        return 'bottom-3 left-3 right-3 sm:left-auto sm:bottom-5 sm:right-5';
    }
  };

  return (
    <>
      {/* Position Update Feedback Toast */}
      {positionToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-1.5 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-cyan-300" />
          <span className="font-semibold">{positionToast}</span>
        </div>
      )}

      {/* 
        DRAGGABLE & DOUBLE-CLICK REPOSITIONABLE TOUR CARD:
        - Freely Draggable via header or drag handle
        - Double-click anywhere on screen to teleport card right there
        - Double-click header to cycle through 4 corner docks
        - 100% Solid Opaque (No background transparency)
      */}
      <aside
        id="myri-tour-floating-card"
        className={`fixed z-50 pointer-events-auto transition-shadow ${
          customPos ? '' : getCornerClasses()
        } sm:w-[320px] rounded-2xl bg-[#0d111a] border-2 ${
          isDragging ? 'border-cyan-300 shadow-cyan-500/50 cursor-grabbing' : 'border-cyan-400 shadow-2xl'
        } text-white`}
        style={
          customPos
            ? {
                position: 'fixed',
                left: `${customPos.x}px`,
                top: `${customPos.y}px`,
                width: '320px',
                maxWidth: 'calc(100vw - 20px)',
                boxShadow: isDragging
                  ? '0 25px 50px rgba(0, 0, 0, 0.98), 0 0 35px rgba(34, 211, 238, 0.6)'
                  : '0 20px 45px rgba(0, 0, 0, 0.95), 0 0 25px rgba(34, 211, 238, 0.4)',
                userSelect: isDragging ? 'none' : 'auto',
              }
            : {
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.95), 0 0 25px rgba(34, 211, 238, 0.4)',
              }
        }
      >
        {/* Compact Drag-Enabled Header */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleHeaderDblClick}
          className="flex items-center justify-between px-3 py-2 bg-[#121824] border-b border-white/10 rounded-t-2xl cursor-grab active:cursor-grabbing select-none"
          title="Drag to move card | Double-click header to cycle corners | Double-click screen to teleport"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Drag Handle Grip Icon */}
            <div className="text-white/40 hover:text-cyan-400 cursor-grab active:cursor-grabbing shrink-0" title="Drag to move">
              <GripHorizontal className="w-4 h-4" />
            </div>

            <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <StepIcon className="w-3 h-3" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white truncate">
                  MYRI TOUR
                </span>
                <span className="text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded border border-cyan-500/30">
                  {currentStepIndex + 1}/{TOUR_STEPS.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Reset Position (when moved) */}
            {(customPos !== null || cornerAnchor !== 'bottom-right') && (
              <button
                onClick={handleResetPosition}
                className="p-1 text-white/50 hover:text-cyan-300 rounded hover:bg-white/10 transition-all"
                title="Reset position to default corner"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Focus button */}
            <button
              onClick={scrollToTarget}
              className="p-1 text-cyan-400 hover:text-white rounded hover:bg-white/10 transition-all"
              title="Focus item on screen"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Minimize toggle */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 transition-all hidden sm:block"
              title={isMinimized ? 'Expand Card' : 'Minimize Card'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Corner cycle toggle */}
            <button
              onClick={(e) => handleHeaderDblClick(e as unknown as React.MouseEvent)}
              className="p-1 text-white/50 hover:text-cyan-300 rounded hover:bg-white/10 transition-all hidden sm:block"
              title="Switch Corner Dock Position"
            >
              <Move className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Close / Skip */}
            <button
              onClick={handleSkip}
              className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 transition-all"
              title="Close Guide (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized View (Ultra compact 1-line bar) */}
        {isMinimized ? (
          <div className="p-2.5 flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-bold truncate">
              {currentStepIndex + 1}. {currentStep.title}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleNext}
                className="px-2 py-1 rounded bg-cyan-600 text-[10px] font-bold text-white flex items-center gap-1"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Expanded Card Body */
          <div className="p-3 space-y-2 text-white max-h-[55vh] sm:max-h-[65vh] overflow-y-auto">
            {/* Quick interactive hint pill */}
            <div className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between text-[9px] text-cyan-300/80">
              <span className="flex items-center gap-1">
                <Move className="w-2.5 h-2.5 text-cyan-400" />
                <span>Screen par double-click karke position change karein</span>
              </span>
              <span className="text-white/40">Drag header</span>
            </div>

            {/* Active item tracker pill */}
            <div className="px-2 py-1 rounded-lg bg-[#141b29] border border-cyan-500/20 flex items-center justify-between gap-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span className="text-white/50 uppercase font-bold">Target:</span>
                <span className="text-cyan-300 font-semibold truncate">{currentStep.targetName}</span>
              </div>
              <span className="text-white/40 text-[9px] shrink-0 font-mono">
                {currentStep.screenLocation}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white leading-tight">
                {currentStep.title}
              </h4>
              <p className="text-[11px] text-white/80 leading-relaxed font-sans">
                {currentStep.description}
              </p>
            </div>

            {/* Checklist features */}
            <div className="p-2 rounded-lg bg-[#121824] border border-white/5 space-y-1 text-[10px] text-white/85">
              {currentStep.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{feat}</span>
                </div>
              ))}
            </div>

            {/* Progress Dots & Navigation Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
              {/* Dots */}
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-4 bg-cyan-400'
                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                    title={`Step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSkip}
                  className="text-[10px] text-white/40 hover:text-white px-1.5 py-1"
                >
                  Skip
                </button>

                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-md border border-white/10 text-white/70 hover:text-white text-[10px]"
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-[10px] font-bold text-white shadow-sm flex items-center gap-1"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Start Solving' : 'Next'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// First-Time Visitor Prompt Toast (Non-intrusive bottom corner)
// ---------------------------------------------------------------------------
interface OnboardingWelcomeToastProps {
  onStartTour: () => void;
  onDismiss: () => void;
}

export function OnboardingWelcomeToast({ onStartTour, onDismiss }: OnboardingWelcomeToastProps) {
  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-45 max-w-xs w-full p-3 rounded-2xl bg-[#0d111a] border-2 border-cyan-400 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Compass className="w-4 h-4 animate-spin-slow" />
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[11px] font-bold text-white">Welcome Detective!</h4>
            <span className="text-[8px] font-bold uppercase bg-cyan-500/20 text-cyan-400 px-1 py-0.2 rounded">
              Guide
            </span>
          </div>
          <p className="text-[10px] text-white/70 leading-snug">
            Interactive tour shuru karein to learn how to solve mysteries with Myri AI?
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={onDismiss}
          className="text-[10px] text-white/40 hover:text-white px-1.5 py-0.5"
        >
          Later
        </button>
        <button
          onClick={onStartTour}
          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-[10px] font-bold text-white shadow-sm flex items-center gap-1 transition-all"
        >
          <span>Start Tour</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
