
import React from 'react';
import { VideoLayout, InterviewTrack, Difficulty, Question } from '../types';

interface SetupScreenProps {
  layout: VideoLayout;
  setLayout: (l: VideoLayout) => void;
  track: InterviewTrack;
  setTrack: (t: InterviewTrack) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  currentQuestion: Question;
  onShuffle: () => void;
  onStart: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  layout, setLayout, track, setTrack, difficulty, setDifficulty, currentQuestion, onShuffle, onStart
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Practice for your next big interview.</h2>
          <p className="text-slate-500 dark:text-slate-400">Set up your session parameters and our AI interviewer will provide follow-up questions while you speak.</p>
        </div>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <h3 className="font-semibold text-lg border-b border-slate-50 dark:border-slate-700 pb-2">Session Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Interview Track</label>
              <select 
                value={track}
                onChange={(e) => setTrack(e.target.value as InterviewTrack)}
                className="w-full bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option>Behavioral</option>
                <option>Product/Strategy</option>
                <option>Data/Analytics</option>
                <option>Leadership</option>
                <option>Tell me about yourself</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Video Layout</label>
            <div className="flex gap-2">
              {(['16:9', '9:16', '3:4', '1:1'] as VideoLayout[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`flex-1 p-2 rounded-lg text-sm font-medium border transition-all ${
                    layout === l 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-indigo-50 dark:bg-indigo-950/30 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">Starter Question</h3>
            <button 
              onClick={onShuffle}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              Shuffle
            </button>
          </div>
          <p className="text-xl font-medium text-slate-800 dark:text-slate-100 italic leading-relaxed">
            "{currentQuestion.text}"
          </p>
        </section>

        <button 
          onClick={onStart}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
          Enter Recording Booth
        </button>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-3xl p-12 text-center space-y-4 border-2 border-dashed border-slate-300 dark:border-slate-700 h-full">
        <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
        <div className="max-w-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Camera Preview</p>
          <p className="text-sm text-slate-500">Your camera will turn on once you enter the booth. We'll ask for permissions there.</p>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
