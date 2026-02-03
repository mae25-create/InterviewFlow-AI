
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { RecordingSession, TimedTranscript } from '../types';
import { LAYOUT_CONFIGS } from '../constants';

interface PlaybackScreenProps {
  session: RecordingSession;
  onNewSession: () => void;
}

const PlaybackScreen: React.FC<PlaybackScreenProps> = ({ session: initialSession, onNewSession }) => {
  const [session, setSession] = useState<RecordingSession>(initialSession);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  useEffect(() => {
    const timedTranscript = session.timedTranscript || [];
    if (timedTranscript.length === 0) return;

    let currentIdx = -1;
    for (let i = 0; i < timedTranscript.length; i++) {
      if (currentTime >= timedTranscript[i].timestamp) {
        currentIdx = i;
      } else {
        break;
      }
    }

    if (currentIdx !== activeIndex) {
      setActiveIndex(currentIdx);
      if (currentIdx !== -1 && transcriptContainerRef.current) {
        const activeElement = transcriptContainerRef.current.querySelector(`[data-index="${currentIdx}"]`);
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }
  }, [currentTime, session.timedTranscript, activeIndex]);

  const handleDownloadVideo = () => {
    const a = document.createElement('a');
    a.href = session.url;
    a.download = `interview-flow-${session.track.toLowerCase()}.mp4`;
    a.click();
  };

  const handleExportTranscript = () => {
    const element = document.createElement("a");
    const text = session.fullTranscript || "No transcript available.";
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${session.track.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const generateFeedback = async () => {
    const transcriptText = session.fullTranscript?.trim();
    if (!transcriptText || transcriptText.length < 10) {
      setAnalysisError("The session was too short for a full analysis.");
      return;
    }

    if (!process.env.API_KEY) {
      setAnalysisError("AI Coach is currently offline.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptText = `
        Act as an expert executive interview coach. Analyze this mock interview response:
        
        CONTEXT:
        - Track: ${session.track}
        - Difficulty: ${session.difficulty}
        - Mode: ${session.mode}
        - Core Question: ${session.starterQuestion}
        
        TRANSCRIPT:
        "${transcriptText}"

        Provide a professional report in Markdown:
        1. **Executive Score**: Score 1-10 and key takeaway.
        2. **Communication Quality**: Structure, clarity, and authority.
        3. **Specific Feedback**: Did they answer the question? Use of specific examples?
        4. **AI Follow-up Reaction**: How did they handle the interjected questions?
        5. **Improvement Roadmap**: 3 concrete steps to level up.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: promptText
      });

      const feedback = response.text || "Feedback generation failed.";
      setSession(prev => ({ ...prev, feedback }));
    } catch (err: any) {
      setAnalysisError(`Coaching Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seekTo = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play().catch(() => {});
    }
  };

  const currentPrompt = session.prompts.find(p => 
    currentTime >= p.timestamp && currentTime <= p.timestamp + 8
  );

  return (
    <div className="grid lg:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="lg:col-span-8 space-y-8">
        {/* Playback HUD */}
        <div className={`relative ${LAYOUT_CONFIGS[session.aspectRatio]} bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10 border-4 border-slate-900`}>
          <video 
            ref={videoRef}
            src={session.url} 
            controls 
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
          />
          
          {currentPrompt && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-none">
              <div className="bg-indigo-600/90 backdrop-blur-xl shadow-2xl p-6 rounded-[2rem] border border-white/20 animate-in fade-in zoom-in-95 duration-500">
                <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest block mb-2">Interjected follow-up</span>
                <p className="text-white font-bold text-base italic leading-tight">
                  "{currentPrompt.text}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleDownloadVideo}
            className="flex-1 min-w-[160px] bg-slate-800 hover:bg-slate-700 text-white font-black py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all text-sm border border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Save Recording
          </button>
          
          <button 
            onClick={handleExportTranscript}
            className="flex-1 min-w-[160px] bg-slate-800 hover:bg-slate-700 text-white font-black py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all text-sm border border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Text Transcript
          </button>

          {!session.feedback ? (
            <button 
              onClick={generateFeedback}
              disabled={isAnalyzing}
              className="flex-[1.5] min-w-[200px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 text-sm"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Coaching Analysis...
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m9.07 14.43 4.9 4.9"/><path d="m14.93 14.43-4.9 4.9"/></svg>
                  Generate Coaching Report
                </>
              )}
            </button>
          ) : (
             <button 
              onClick={onNewSession}
              className="flex-1 bg-white text-slate-900 hover:bg-slate-200 font-black py-4 px-6 rounded-3xl transition-all shadow-xl text-sm"
            >
              New Session
            </button>
          )}
        </div>

        {analysisError && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-500 text-sm font-bold animate-pulse text-center">
            {analysisError}
          </div>
        )}

        {/* AI Performance Report */}
        {session.feedback && (
          <div className="bg-white dark:bg-slate-800/50 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800/50 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-indigo-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter uppercase">Adaptive AI Feedback</h3>
                <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Session Analysis Report</p>
              </div>
            </div>
            <div className="prose dark:prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed font-medium space-y-6">
              {session.feedback.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return <h4 key={i} className="text-xl font-black mt-8 mb-4 text-indigo-400 border-l-4 border-indigo-500 pl-4">{line.replace('### ', '')}</h4>;
                if (line.startsWith('## ')) return <h3 key={i} className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-700/50 pb-4">{line.replace('## ', '')}</h3>;
                if (line.startsWith('**')) return <p key={i} className="font-black text-white text-lg">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-2 text-slate-400">{line.replace('- ', '')}</li>;
                return <p key={i} className="whitespace-pre-wrap">{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>

      <aside className="lg:col-span-4 space-y-8 h-full sticky top-24">
        {/* Interactive Synchronized Transcript */}
        <div className="bg-white dark:bg-slate-800/30 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800/50 shadow-2xl backdrop-blur-3xl h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter">Live Log</h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synced</span>
            </div>
          </div>
          
          <div 
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2"
          >
            {session.timedTranscript && session.timedTranscript.length > 0 ? (
              <div className="flex flex-col gap-4">
                {session.timedTranscript.map((chunk, i) => (
                  <div
                    key={i}
                    data-index={i}
                    onClick={() => seekTo(chunk.timestamp)}
                    className={`cursor-pointer transition-all duration-300 p-4 rounded-2xl group ${
                      activeIndex === i 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-2' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                       <span className={`text-[9px] font-black uppercase ${activeIndex === i ? 'text-indigo-200' : 'text-slate-500'}`}>
                         T+{Math.floor(chunk.timestamp)}s
                       </span>
                    </div>
                    <p className={`text-sm font-bold ${activeIndex === i ? 'text-white' : 'text-slate-300'}`}>
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-center py-20 font-bold uppercase tracking-widest text-[10px]">No log found</p>
            )}
          </div>
          <p className="mt-6 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] text-center">Click log entry to seek</p>
        </div>

        {/* AI Prompt Timeline */}
        <div className="bg-indigo-600/5 rounded-[2.5rem] p-8 border border-indigo-500/20">
          <h3 className="font-black uppercase tracking-tighter text-indigo-400 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
            Follow-up Timeline
          </h3>
          <div className="space-y-4">
            {session.prompts.length > 0 ? (
              session.prompts.map((p, i) => (
                <button 
                  key={p.id}
                  onClick={() => seekTo(p.timestamp)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all group ${
                    currentTime >= p.timestamp && currentTime <= p.timestamp + 8
                    ? 'bg-indigo-600 border-indigo-400 shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[9px] font-black uppercase ${currentTime >= p.timestamp && currentTime <= p.timestamp + 8 ? 'text-indigo-200' : 'text-indigo-500'}`}>Prompt {i + 1}</span>
                    <span className="text-[10px] font-black text-slate-500">{Math.floor(p.timestamp)}s</span>
                  </div>
                  <p className={`text-xs font-bold leading-tight ${currentTime >= p.timestamp && currentTime <= p.timestamp + 8 ? 'text-white' : 'text-slate-400'}`}>
                    "{p.text}"
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center py-6 text-slate-600 text-[10px] font-black uppercase tracking-widest">No follow-ups recorded</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PlaybackScreen;
