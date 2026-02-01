
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { VideoLayout, InterviewTrack, Difficulty, Question, AIPrompt, RecordingSession } from '../types';
import { LAYOUT_CONFIGS } from '../constants';

interface RecordingScreenProps {
  layout: VideoLayout;
  track: InterviewTrack;
  difficulty: Difficulty;
  starterQuestion: Question;
  onFinished: (session: RecordingSession) => void;
  onCancel: () => void;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const RecordingScreen: React.FC<RecordingScreenProps> = ({
  layout, track, difficulty, starterQuestion, onFinished, onCancel
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<AIPrompt | null>(null);
  const [transcriptSnippets, setTranscriptSnippets] = useState<string[]>([]);

  // Refs to avoid stale closures in MediaRecorder.onstop and ScriptProcessor
  const recordingActiveRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const timerValueRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const fullTranscriptRef = useRef<string>("");
  const promptsHistoryRef = useRef<AIPrompt[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          aspectRatio: layout === '16:9' ? 1.777 : layout === '9:16' ? 0.5625 : layout === '3:4' ? 0.75 : 1
        },
        audio: true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to access camera or microphone. Please check permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [layout]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const setupGeminiLive = async () => {
    if (!streamRef.current) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              // IMPORTANT: Using ref to check recording status
              if (!recordingActiveRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              if (text && text.trim().endsWith('?')) {
                const newPrompt: AIPrompt = {
                  id: Math.random().toString(36).substr(2, 9),
                  text: text.trim().slice(0, 100),
                  timestamp: (Date.now() - startTimeRef.current) / 1000
                };
                setActivePrompt(newPrompt);
                promptsHistoryRef.current.push(newPrompt);
                setTimeout(() => setActivePrompt(curr => curr?.id === newPrompt.id ? null : curr), 7000);
              }
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) {
                fullTranscriptRef.current += " " + text;
                setTranscriptSnippets(prev => [...prev.slice(-3), text]);
              }
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are a silent interviewer. Your only output should be short follow-up questions (under 12 words) that help the user refine their answer. 
          Use the STAR method for behavioral tracks. 
          For difficulty: ${difficulty}, adjust your questions.
          DO NOT speak. Provide questions only via transcription.
          The track is: ${track}. The initial question was: ${starterQuestion.text}.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Gemini Live failed:", err);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    fullTranscriptRef.current = "";
    promptsHistoryRef.current = [];
    timerValueRef.current = 0;
    
    const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') 
      ? 'video/mp4' 
      : 'video/webm;codecs=vp9,opus';
      
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Use ref values to avoid stale closures
      onFinished({
        blob,
        url,
        startTime: startTimeRef.current,
        duration: timerValueRef.current,
        prompts: [...promptsHistoryRef.current],
        transcript: [], 
        fullTranscript: fullTranscriptRef.current.trim(),
        track,
        difficulty,
        aspectRatio: layout,
        starterQuestion: starterQuestion.text
      });
    };

    startTimeRef.current = Date.now();
    recorder.start(1000);
    setIsRecording(true);
    recordingActiveRef.current = true;
    setTimer(0);
    timerRef.current = window.setInterval(() => {
      timerValueRef.current += 1;
      setTimer(timerValueRef.current);
    }, 1000);
    setupGeminiLive();
  };

  const stopRecording = () => {
    recordingActiveRef.current = false;
    setIsRecording(false);
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // Give a small moment for last transcript chunks to arrive before closing session
    setTimeout(() => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    }, 500);

    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Recording Error</h3>
        <p className="text-red-600 dark:text-red-500 mb-6">{error}</p>
        <button onClick={onCancel} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold">Return to Setup</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
      <div className={`relative w-full ${LAYOUT_CONFIGS[layout]} bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800`}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
              {isRecording ? 'RECORDING' : 'READY'}
              {isRecording && <span className="ml-1 font-mono">{formatTime(timer)}</span>}
            </div>
            <div className="bg-indigo-500 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg">
              {track} • {difficulty}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            {activePrompt && (
              <div className="bg-white/95 backdrop-blur shadow-2xl p-4 rounded-2xl max-w-sm border-l-4 border-indigo-500 transform animate-in slide-in-from-bottom-2 duration-300 pointer-events-auto">
                <p className="text-slate-900 font-semibold text-sm leading-relaxed italic">
                  "{activePrompt.text}"
                </p>
                <div className="mt-1 text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">Follow-up Question</div>
              </div>
            )}

            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-2xl w-full max-w-md border border-white/10">
              <p className="text-white/90 text-sm italic line-clamp-2">
                "{starterQuestion.text}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isRecording ? (
          <>
            <button 
              onClick={onCancel}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 rounded-2xl font-bold hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={startRecording}
              disabled={!isCameraReady}
              className="px-10 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-white rounded-full" />
              Start Practice
            </button>
          </>
        ) : (
          <button 
            onClick={stopRecording}
            className="px-12 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-red-50 rounded-sm" />
            Finish & Review
          </button>
        )}
      </div>

      {isRecording && transcriptSnippets.length > 0 && (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Real-time Transcript</h4>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {transcriptSnippets.map((s, i) => (
              <p key={i} className={i === transcriptSnippets.length - 1 ? 'opacity-100' : 'opacity-40'}>
                {s}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingScreen;
