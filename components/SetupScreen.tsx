
import React from 'react';
import { VideoLayout, InterviewTrack, Difficulty, Question, InterviewMode } from '../types';

interface SetupScreenProps {
  layout: VideoLayout;
  setLayout: (l: VideoLayout) => void;
  mode: InterviewMode;
  setMode: (m: InterviewMode) => void;
  track: InterviewTrack;
  setTrack: (t: InterviewTrack) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  currentQuestion: Question;
  onShuffle: () => void;
  onStart: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  layout, setLayout, mode, setMode, track, setTrack, difficulty, setDifficulty, currentQuestion, onShuffle, onStart
}) => {
  return (
    <div className="grid lg:grid-cols-5 gap-10 items-start animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="lg:col-span-3 space-y-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-[1.1]">
            Master your narrative with <span className="text-indigo-500">Real-time AI</span> feedback.
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
            Our proprietary AI interviewer listens to your answers and generates human-like follow-up questions to test your depth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button 
            onClick={() => setMode('Quick Practice')}
            className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 group ${
              mode === 'Quick Practice' 
              ? 'bg-indigo-600/10 border-indigo-500 shadow-xl shadow-indigo-500/10' 
              : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              mode === 'Quick Practice' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-3.5-6.5c0 2.5-1.5 4.9-3.5 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7Z"/></svg>
            </div>
            <h4 className="font-bold text-lg mb-1">Quick Practice</h4>
            <p className="text-sm text-slate-400">Focus on a single core question with AI follow-ups.</p>
          </button>

          <button 
            onClick={() => setMode('Full Mock Interview')}
            className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 group ${
              mode === 'Full Mock Interview' 
              ? 'bg-purple-600/10 border-purple-500 shadow-xl shadow-purple-500/10' 
              : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              mode === 'Full Mock Interview' ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h4 className="font-bold text-lg mb-1">Mock Interview</h4>
            <p className="text-sm text-slate-400">Multi-turn conversation led by our Adaptive AI.</p>
          </button>
        </div>

        <section className="bg-white dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-8 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Track focus</label>
              <select 
                value={track}
                onChange={(e) => setTrack(e.target.value as InterviewTrack)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              >
                <option>Behavioral</option>
                <option>Product/Strategy</option>
                <option>Data/Analytics</option>
                <option>Leadership</option>
                <option>Tell me about yourself</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Complexity</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Aspect Ratio</label>
            <div className="flex gap-3">
              {(['16:9', '9:16', '3:4', '1:1'] as VideoLayout[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`flex-1 p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                    layout === l 
                    ? 'bg-white dark:bg-slate-100 text-slate-900 border-white' 
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
        <section className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/30 flex-1 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-3 py-1 rounded-full">Core Prompt</span>
              <button 
                onClick={onShuffle}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:rotate-180 duration-500"
                title="Shuffle Question"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </button>
            </div>
            <p className="text-2xl md:text-3xl font-bold italic leading-tight">
              "{currentQuestion.text}"
            </p>
          </div>
        </section>

        <button 
          onClick={onStart}
          className="w-full bg-white text-slate-900 dark:bg-slate-100 hover:bg-white/90 font-black py-6 rounded-[2rem] shadow-xl shadow-white/10 transform active:scale-95 transition-all flex items-center justify-center gap-3 text-xl tracking-tight"
        >
          <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/40 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          Enter Booth
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
