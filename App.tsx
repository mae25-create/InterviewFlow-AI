
import React, { useState, useEffect, useCallback } from 'react';
import { VideoLayout, InterviewTrack, Difficulty, Question, RecordingSession, InterviewMode } from './types';
import { QUESTIONS } from './constants';
import SetupScreen from './components/SetupScreen';
import RecordingScreen from './components/RecordingScreen';
import PlaybackScreen from './components/PlaybackScreen';

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'recording' | 'playback'>('setup');
  const [layout, setLayout] = useState<VideoLayout>('16:9');
  const [mode, setMode] = useState<InterviewMode>('Quick Practice');
  const [track, setTrack] = useState<InterviewTrack>('Behavioral');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [currentQuestion, setCurrentQuestion] = useState<Question>(QUESTIONS[0]);
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync current question when track or difficulty changes
  useEffect(() => {
    const matchedQuestions = QUESTIONS.filter(q => q.category === track && q.difficulty === difficulty);
    if (matchedQuestions.length > 0) {
      // Pick a random one from the matched set
      setCurrentQuestion(matchedQuestions[Math.floor(Math.random() * matchedQuestions.length)]);
    } else {
      // Fallback if no specific match (should not happen with our set)
      const categoryOnly = QUESTIONS.filter(q => q.category === track);
      if (categoryOnly.length > 0) {
        setCurrentQuestion(categoryOnly[0]);
      }
    }
  }, [track, difficulty]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleShuffleQuestion = useCallback(() => {
    const matchedQuestions = QUESTIONS.filter(q => q.category === track && q.difficulty === difficulty);
    const otherQuestions = matchedQuestions.filter(q => q.id !== currentQuestion.id);
    const targetPool = otherQuestions.length > 0 ? otherQuestions : matchedQuestions;
    
    if (targetPool.length > 0) {
      setCurrentQuestion(targetPool[Math.floor(Math.random() * targetPool.length)]);
    }
  }, [track, difficulty, currentQuestion]);

  const handleStartRecording = () => {
    setView('recording');
  };

  const handleRecordingFinished = (sessionData: RecordingSession) => {
    setSession(sessionData);
    setView('playback');
  };

  const handleReset = () => {
    setSession(null);
    setView('setup');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="p-4 flex justify-between items-center border-b border-slate-200/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">INTERVIEW<span className="text-indigo-500">FLOW</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Performance Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200/20"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        {view === 'setup' && (
          <SetupScreen 
            layout={layout} setLayout={setLayout}
            mode={mode} setMode={setMode}
            track={track} setTrack={setTrack}
            difficulty={difficulty} setDifficulty={setDifficulty}
            currentQuestion={currentQuestion}
            onShuffle={handleShuffleQuestion}
            onStart={handleStartRecording}
          />
        )}
        {view === 'recording' && (
          <RecordingScreen 
            layout={layout}
            mode={mode}
            track={track}
            difficulty={difficulty}
            starterQuestion={currentQuestion}
            onFinished={handleRecordingFinished}
            onCancel={() => setView('setup')}
          />
        )}
        {view === 'playback' && session && (
          <PlaybackScreen 
            session={session}
            onNewSession={handleReset}
          />
        )}
      </main>
      
      <footer className="p-12 text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">
        Powered by Gemini 2.5 Flash &bull; Adaptive AI Mock Interviews
      </footer>
    </div>
  );
};

export default App;
