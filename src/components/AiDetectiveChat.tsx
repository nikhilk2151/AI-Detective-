'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  Square,
  Mic,
  MicOff,
  Radio,
  Headphones,
  UserCheck
} from 'lucide-react';
import { useCase } from '@/context/CaseContext';

export default function AiDetectiveChat() {
  const { 
    chatMessages, 
    sendChatMessage, 
    isChatLoading, 
    activeCase,
    setActiveDoc,
    documents,
    suspects
  } = useCase();

  const [inputQuery, setInputQuery] = useState('');
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isBriefingPlaying, setIsBriefingPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // AUDIO TEXT-TO-SPEECH (TTS) SYSTEM
  // ---------------------------------------------------------------------------
  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
      .replace(/\[DOC-(\d+)\]/g, 'Document $1') // spell out documents
      .replace(/[#*_`~]/g, '') // remove markdown symbols
      .replace(/•/g, ', ') // bullets to natural pause
      .replace(/\n+/g, '. ') // newlines to full stops
      .trim();
  };

  const playAudio = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Audio playback is not supported by your browser.');
      return;
    }

    // If currently playing this same audio, stop it
    if (activeAudioId === id) {
      window.speechSynthesis.cancel();
      setActiveAudioId(null);
      setIsBriefingPlaying(false);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setActiveAudioId(id);

    const clean = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try to pick a crisp natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      setActiveAudioId(null);
      setIsBriefingPlaying(false);
    };

    utterance.onerror = () => {
      setActiveAudioId(null);
      setIsBriefingPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAllAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioId(null);
    setIsBriefingPlaying(false);
  };

  // Full Case Audio Briefing
  const playCaseAudioBriefing = () => {
    if (!activeCase) return;
    if (isBriefingPlaying) {
      stopAllAudio();
      return;
    }

    const suspectNames = (suspects || []).map((s) => `${s.name}, ${s.role}`).join('. ');
    const briefingText = `Attention Investigator. Official audio briefing for ${activeCase.title}. ` +
      `Crime Scene: ${activeCase.crimeScene}. ` +
      `Incident Time Window: ${activeCase.timeOfCrime}. ` +
      `Stolen Asset or Target: ${activeCase.victimOrTarget}. ` +
      `Suspects on the matrix: ${suspectNames}. ` +
      `Summary: ${activeCase.summary}. ` +
      `Examine the access logs and witness statements carefully to catch discrepancies.`;

    setIsBriefingPlaying(true);
    playAudio(briefingText, 'briefing-audio');
  };

  // ---------------------------------------------------------------------------
  // MICROPHONE SPEECH-TO-TEXT (STT) SYSTEM
  // ---------------------------------------------------------------------------
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Microphone speech recognition is not supported in this browser. Please use Chrome or Edge.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access blocked. Please allow mic permissions.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not initialize microphone.');
    }
  };

  // ---------------------------------------------------------------------------
  // CHAT SEND & CITATION CLICKS
  // ---------------------------------------------------------------------------
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isChatLoading) return;
    const text = inputQuery;
    setInputQuery('');
    stopAllAudio();
    await sendChatMessage(text);
  };

  const openDoc = (docNum: string) => {
    const found = documents.find((d) => d.docNumber === docNum);
    if (found) {
      setActiveDoc(found);
    }
  };

  // Render text with clickable citations
  const renderFormattedText = (text: string) => {
    const docRegex = /(\[DOC-\d+\])/g;
    const parts = text.split(docRegex);

    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {parts.map((part, i) => {
          if (docRegex.test(part)) {
            const clean = part.replace(/[\[\]]/g, '');
            return (
              <button
                key={i}
                onClick={() => openDoc(clean)}
                className="inline-flex items-center space-x-1 mx-1 px-2 py-0.5 rounded font-mono text-xs font-bold bg-ai-blue/20 text-ai-cyan border border-ai-blue/40 hover:bg-ai-blue hover:text-white transition-colors"
                title={`Open evidence file ${clean}`}
              >
                <span>{part}</span>
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  // Dynamic quick suspect inquiry prompts
  const quickPrompts = [
    'Tell complete report about the case',
    'Show all suspects, relationships & check-in/out times',
    'Who is Ram? Was he involved in this case?',
    'Who is Santosh? Did he check into the scene?',
    ...(suspects && suspects[0] ? [`Who is ${suspects[0].name}? Check-in & alibi analysis`] : []),
    ...(suspects && suspects[1] ? [`Was ${suspects[1].name} inside during the crime window?`] : []),
    'Who is lying about their alibi in the access logs?',
  ];

  return (
    <div id="tour-ai-chat-section" className="bg-dark-900 border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ai-darkblue to-ai-blue flex items-center justify-center text-white shadow-blue-glow shrink-0">
            <Bot className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Myri AI • Voice & Forensic Assistant
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AUDIO ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask about any person (e.g. &quot;Who is Michael?&quot;), alibi, or listen to voice audio playback
            </p>
          </div>
        </div>

        {/* Global Case Audio Briefing Player Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={playCaseAudioBriefing}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
              isBriefingPlaying
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 hover:text-white'
            }`}
            title="Listen to full case audio overview"
          >
            {isBriefingPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Case Audio</span>
              </>
            ) : (
              <>
                <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                <span>Play Case Audio Briefing</span>
              </>
            )}
          </button>

          {activeAudioId && (
            <button
              onClick={stopAllAudio}
              className="p-1.5 rounded-xl bg-dark-950 border border-white/10 text-slate-400 hover:text-white"
              title="Stop Audio"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Audio Playing Equalizer Pill */}
      {activeAudioId && (
        <div className="px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold">AI Detective Speaking Audio Output...</span>
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-3 bg-cyan-400 animate-bounce" />
              <span className="w-0.5 h-2 bg-cyan-400 animate-bounce delay-75" />
              <span className="w-0.5 h-3.5 bg-cyan-400 animate-bounce delay-150" />
            </span>
          </div>
          <button
            onClick={stopAllAudio}
            className="text-[10px] uppercase font-bold text-rose-400 hover:underline flex items-center gap-1"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
            <span>Mute</span>
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="h-80 overflow-y-auto space-y-3 p-2 rounded-2xl bg-dark-950/70 border border-white/5">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          const isThisAudioPlaying = activeAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-ai-blue text-white'
                    : 'bg-dark-800 border border-white/10 text-ai-cyan'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                  isUser
                    ? 'bg-ai-blue/15 border border-ai-blue/30 text-white'
                    : 'bg-dark-900 border border-white/10 text-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {isUser ? 'You' : 'Myri AI Sherlock'}
                    {!isUser && (
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1 py-0.2 rounded border border-cyan-500/20 font-sans">
                        Audio Ready
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {/* Audio Play/Stop Button for AI Messages */}
                    {!isUser && (
                      <button
                        onClick={() => playAudio(msg.content, msg.id)}
                        className={`p-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                          isThisAudioPlaying
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
                        }`}
                        title={isThisAudioPlaying ? 'Stop Audio' : 'Play Audio Voice'}
                      >
                        {isThisAudioPlaying ? (
                          <>
                            <Square className="w-2.5 h-2.5 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-cyan-400" />
                            <span>Play Audio</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {renderFormattedText(msg.content)}

                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-white/5 text-[10px]">
                    <span className="text-slate-400">Sources:</span>
                    {msg.citations.map((c) => (
                      <button
                        key={c}
                        onClick={() => openDoc(c)}
                        className="px-1.5 py-0.2 rounded bg-dark-950 text-ai-cyan border border-ai-blue/30 hover:border-ai-cyan"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-center space-x-2 p-3 text-xs text-ai-cyan font-mono bg-ai-blue/10 rounded-xl border border-ai-blue/20">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing case files, suspect timelines & electronic telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts (Dynamic Suspect Inquiries) */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Interrogation Questions:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                stopAllAudio();
                sendChatMessage(qp);
              }}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-dark-950 hover:bg-dark-800 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white transition-all flex items-center space-x-1"
            >
              <span>{qp}</span>
              <ChevronRight className="w-3 h-3 text-cyan-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Microphone Error Alert */}
      {speechError && (
        <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
          {speechError}
        </div>
      )}

      {/* Chat & Voice Input */}
      <form onSubmit={handleSend} className="flex items-center space-x-2">
        {/* Microphone Button (Speech-to-Text) */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-2.5 rounded-2xl border transition-all shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
              : 'bg-dark-950 hover:bg-dark-850 border-white/10 text-cyan-400 hover:border-cyan-400/40'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak Question with Microphone'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            isListening 
              ? 'Listening... Speak: "Tell complete report" or "Who is Ram/Maya?"' 
              : `Ask "Tell complete report about the case" or "Who is Ram/Santosh/Maya?"...`
          }
          className={`flex-1 bg-dark-950 border ${
            isListening ? 'border-rose-400 ring-2 ring-rose-500/20' : 'border-white/10'
          } rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans`}
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isChatLoading}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-ai-blue to-crime-red hover:from-ai-lightblue hover:to-crime-lightred text-white disabled:opacity-40 transition-all shadow-md shrink-0"
          title="Send query to Gemini AI"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
