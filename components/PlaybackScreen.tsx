
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { RecordingSession } from '../types';
import { LAYOUT_CONFIGS } from '../constants';

interface PlaybackScreenProps {
  session: RecordingSession;
  onNewSession: () => void;
}

const PlaybackScreen: React.FC<PlaybackScreenProps> = ({ session: initialSession, onNewSession }) => {
  const [session, setSession] = useState<RecordingSession>(initialSession);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when a new session is provided
    setSession(initialSession);
  }, [initialSession]);

  const handleDownloadVideo = () => {
    const a = document.createElement('a');
    a.href = session.url;
    a.download = `interview-video-${session.track.toLowerCase().replace(/\s+/g, '-')}.mp4`;
    a.click();
  };

  const handleExportTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([session.fullTranscript || "No transcript available."], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${session.track.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const copyToClipboard = () => {
    if (!session.fullTranscript) return;
    navigator.clipboard.writeText(session.fullTranscript);
    alert("Transcript copied to clipboard!");
  };

  const generateFeedback = async () => {
    const transcriptText = session.fullTranscript?.trim();
    if (!transcriptText || transcriptText.length < 10) {
      setAnalysisError("The transcript is too short for a meaningful analysis. Make sure your microphone is working and you speak clearly during the recording!");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptText = `
        Act as an expert interview coach. Analyze the following interview response:
        
        CONTEXT:
        - Track: ${session.track}
        - Difficulty: ${session.difficulty}
        - Starter Question: ${session.starterQuestion}
        
        TRANSCRIPT:
        "${transcriptText}"

        Please provide a professional feedback report in Markdown:
        1. **Executive Summary**: A summary impression and estimated performance level.
        2. **Content Analysis**: Evaluate the use of the STAR method, technical accuracy (if applicable), and specific metrics mentioned.
        3. **Delivery Analysis**: Comment on clarity, conciseness, and tone based on the transcript.
        4. **Actionable Recommendations**: 3 specific things the user should do to improve this specific answer.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: promptText
      });

      const feedback = response.text || "Analysis complete, but no output was generated.";
      setSession(prev => ({ ...prev, feedback }));
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setAnalysisError(`Failed to generate feedback: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const currentPrompt = session.prompts.find(p => 
    currentTime >= p.timestamp && currentTime <= p.timestamp + 7
  );

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <div className={`relative ${LAYOUT_CONFIGS[session.aspectRatio]} bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800`}>
          <video 
            ref={videoRef}
            src={session.url} 
            controls 
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
          />
          
          {currentPrompt && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-none">
              <div className="bg-white/95 backdrop-blur shadow-2xl p-4 rounded-2xl border-l-4 border-indigo-500 animate-in fade-in zoom-in-95">
                <p className="text-slate-900 font-semibold text-sm italic leading-relaxed">
                  "{currentPrompt.text}"
                </p>
                <div className="mt-1 text-[10px] text-indigo-500 font-bold uppercase">AI Follow-up</div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleDownloadVideo}
            className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Save Video
          </button>
          
          <button 
            onClick={handleExportTranscript}
            className="flex-1 min-w-[120px] bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Text
          </button>

          {!session.feedback && (
            <button 
              onClick={generateFeedback}
              disabled={isAnalyzing}
              className="flex-1 min-w-[180px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.5 12"/><path d="M12 12l9.5 0"/><path d="M12 12V2.5"/><path d="M12 12l7 7"/><path d="M12 12l-7-7"/></svg>
                  Analyze Performance
                </>
              )}
            </button>
          )}

          <button 
            onClick={onNewSession}
            className="flex-1 min-w-[120px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold py-3 px-4 rounded-2xl hover:bg-slate-50 transition-all text-sm"
          >
            Start Over
          </button>
        </div>

        {analysisError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">
            {analysisError}
          </div>
        )}

        {/* AI Performance Analysis Section */}
        {session.feedback && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              Coaching Report
            </h3>
            <div className="prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              {session.feedback.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return <h4 key={i} className="text-lg font-bold mt-6 mb-2 text-indigo-600 dark:text-indigo-400">{line.replace('### ', '')}</h4>;
                if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold mt-8 mb-4 border-b pb-2 border-slate-100 dark:border-slate-700">{line.replace('## ', '')}</h3>;
                if (line.startsWith('**')) return <p key={i} className="font-semibold text-slate-900 dark:text-white">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                return <p key={i} className="whitespace-pre-wrap">{line}</p>;
              })}
            </div>
          </div>
        )}

        {/* Transcript Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              Speech Transcript
            </h3>
            <button 
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </button>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar">
            {session.fullTranscript ? (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                {session.fullTranscript}
              </p>
            ) : (
              <p className="text-slate-400 italic text-center py-10">No speech was detected. Please ensure your microphone is enabled and try recording again.</p>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-lg">Session Data</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Track</p>
              <p className="font-semibold text-sm">{session.track}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Level</p>
              <p className="font-semibold text-sm">{session.difficulty}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-4">AI Guide Moments</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {session.prompts.length > 0 ? (
              session.prompts.map((p, i) => (
                <button 
                  key={p.id}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = p.timestamp;
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all group ${
                    currentTime >= p.timestamp && currentTime <= p.timestamp + 7
                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Prompt {i + 1}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.floor(p.timestamp / 60)}:{(Math.floor(p.timestamp % 60)).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors italic leading-relaxed">
                    "{p.text}"
                  </p>
                </button>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                <p className="text-xs italic">No follow-ups triggered.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PlaybackScreen;
