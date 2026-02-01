
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoLayout, InterviewTrack, Difficulty, Question, AIPrompt, RecordingSession } from './types';
import { QUESTIONS } from './constants';
import SetupScreen from './components/SetupScreen';
import RecordingScreen from './components/RecordingScreen';
import PlaybackScreen from './components/PlaybackScreen';

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'recording' | 'playback'>('setup');
  const [layout, setLayout] = useState<VideoLayout>('16:9');
  const [track, setTrack] = useState<InterviewTrack>('Behavioral');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [currentQuestion, setCurrentQuestion] = useState<Question>(QUESTIONS[0]);
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Set initial random question for the selected track
  useEffect(() => {
    const trackQuestions = QUESTIONS.filter(q => q.category === track);
    if (trackQuestions.length > 0) {
      setCurrentQuestion(trackQuestions[Math.floor(Math.random() * trackQuestions.length)]);
    }
  }, [track]);

  const handleShuffleQuestion = useCallback(() => {
    const trackQuestions = QUESTIONS.filter(q => q.category === track);
    const otherQuestions = trackQuestions.filter(q => q.id !== currentQuestion.id);
    if (otherQuestions.length > 0) {
      setCurrentQuestion(otherQuestions[Math.floor(Math.random() * otherQuestions.length)]);
    }
  }, [track, currentQuestion]);

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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">I</div>
          <h1 className="text-xl font-bold tracking-tight">InterviewFlow <span className="text-indigo-500">AI</span></h1>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {view === 'setup' && (
          <SetupScreen 
            layout={layout} setLayout={setLayout}
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
      
      <footer className="p-8 text-center text-slate-400 text-sm">
        Built with Gemini Live API &bull; 2025 InterviewFlow AI
      </footer>
    </div>
  );
};

export default App;
