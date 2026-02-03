
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { VideoLayout, InterviewTrack, Difficulty, Question, AIPrompt, RecordingSession, TimedTranscript, InterviewMode } from '../types';
import { LAYOUT_CONFIGS } from '../constants';

interface RecordingScreenProps {
  layout: VideoLayout;
  mode: InterviewMode;
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

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const RecordingScreen: React.FC<RecordingScreenProps> = ({
  layout, mode, track, difficulty, starterQuestion, onFinished, onCancel
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<AIPrompt | null>(null);
  const [transcriptSnippets, setTranscriptSnippets] = useState<string[]>([]);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);

  const recordingActiveRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const timerValueRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const fullTranscriptRef = useRef<string>("");
  const timedTranscriptRef = useRef<TimedTranscript[]>([]);
  const promptsHistoryRef = useRef<AIPrompt[]>([]);
  
  // Sentence Buffering Logic
  const sentenceBufferRef = useRef<string>("");
  const sentenceStartTimeRef = useRef<number>(0);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
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
      setError("Permissions denied. We need camera and mic access for the booth.");
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
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
  };

  const setupGeminiLive = async () => {
    if (!streamRef.current) return;
    if (!process.env.API_KEY) {
      setError("AI Services currently offline. Key missing.");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
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
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            if (mode === 'Full Mock Interview') {
               sessionPromise.then(s => s.sendRealtimeInput({ 
                 text: `Start the interview for a ${track} position at ${difficulty} difficulty. Greet me and ask: ${starterQuestion.text}` 
               }));
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setAiIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current!);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setAiIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setAiIsSpeaking(false);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              if (text && text.trim().endsWith('?')) {
                const newPrompt: AIPrompt = {
                  id: Math.random().toString(36).substr(2, 9),
                  text: text.trim(),
                  timestamp: (Date.now() - startTimeRef.current) / 1000
                };
                setActivePrompt(newPrompt);
                promptsHistoryRef.current.push(newPrompt);
                setTimeout(() => setActivePrompt(curr => curr?.id === newPrompt.id ? null : curr), 10000);
              }
            }
            
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) {
                const currentRelTime = (Date.now() - startTimeRef.current) / 1000;
                fullTranscriptRef.current += " " + text;
                
                // Smart Sentence Buffering
                if (sentenceBufferRef.current === "") {
                  sentenceStartTimeRef.current = currentRelTime;
                }
                sentenceBufferRef.current += text;
                
                // Check for terminal punctuation or turn complete
                if (/[.?!]\s*$/.test(text) || message.serverContent?.turnComplete) {
                   const finalSentence = sentenceBufferRef.current.trim();
                   if (finalSentence) {
                     timedTranscriptRef.current.push({ text: finalSentence, timestamp: sentenceStartTimeRef.current });
                     setTranscriptSnippets(prev => [...prev.slice(-3), finalSentence]);
                   }
                   sentenceBufferRef.current = "";
                }
              }
            }
          },
          onerror: (e) => console.error("Session Error", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are a professional hiring manager for a ${track} role. 
          The complexity of this interview is ${difficulty}.
          Mode: ${mode === 'Full Mock Interview' ? 'Active Conversation' : 'Follow-up Only'}.
          Adjust your follow-up questions to match the ${difficulty} difficulty level. 
          Be professional, rigorous but fair.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Setup failed", err);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    fullTranscriptRef.current = "";
    timedTranscriptRef.current = [];
    promptsHistoryRef.current = [];
    sentenceBufferRef.current = "";
    timerValueRef.current = 0;
    
    const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') 
      ? 'video/mp4' : 'video/webm;codecs=vp9,opus';
      
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      // Flush final buffer
      if (sentenceBufferRef.current.trim()) {
         timedTranscriptRef.current.push({ text: sentenceBufferRef.current.trim(), timestamp: sentenceStartTimeRef.current });
      }
      
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      onFinished({
        blob, url, startTime: startTimeRef.current, duration: timerValueRef.current,
        prompts: [...promptsHistoryRef.current], timedTranscript: [...timedTranscriptRef.current],
        transcript: [], fullTranscript: fullTranscriptRef.current.trim(),
        track, difficulty, aspectRatio: layout, mode, starterQuestion: starterQuestion.text
      });
    };

    startTimeRef.current = Date.now();
    recorder.start(1000);
    recordingActiveRef.current = true;
    setIsRecording(true);
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
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setTimeout(() => { if (sessionRef.current) sessionRef.current.close(); }, 1000);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/10 rounded-[3rem] border border-red-500/30 max-w-2xl mx-auto backdrop-blur-3xl">
        <h3 className="text-2xl font-black text-red-500 mb-2">Booth Error</h3>
        <p className="text-red-400 mb-8 font-medium">{error}</p>
        <button onClick={onCancel} className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold shadow-xl">Return to Safety</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
      <div className={`relative w-full ${LAYOUT_CONFIGS[layout]} bg-[#020617] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.1)] border-4 border-slate-800 ring-1 ring-slate-700/50`}>
        <video 
          ref={videoRef} 
          autoPlay muted playsInline 
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
               <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-white text-xs font-black flex items-center gap-3 border border-white/10 ring-1 ring-white/5">
                <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-slate-500'}`} />
                {isRecording ? 'LIVE RECORDING' : 'STANDBY'}
                {isRecording && <span className="ml-2 font-mono text-red-400">{formatTime(timer)}</span>}
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] text-white/60 font-black uppercase tracking-widest border border-white/10">
                {layout} &bull; {difficulty}
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-4 py-3 bg-indigo-600/20 backdrop-blur-2xl rounded-2xl border border-indigo-500/30 transition-all duration-500 ${aiIsSpeaking ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
               <span className="text-[10px] font-black text-indigo-300 mr-2">AI INTERVIEWER</span>
               {[...Array(5)].map((_, i) => (
                 <div 
                   key={i} 
                   className={`w-1 bg-indigo-400 rounded-full transition-all duration-200 ${aiIsSpeaking ? 'animate-bounce' : 'h-1'}`}
                   style={{ 
                     height: aiIsSpeaking ? `${Math.random() * 20 + 5}px` : '4px',
                     animationDelay: `${i * 0.1}s` 
                   }}
                 />
               ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {activePrompt && (
              <div className="bg-indigo-600 shadow-[0_20px_50px_rgba(79,70,229,0.3)] p-6 rounded-[2rem] max-w-md border border-white/20 transform animate-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Follow-up Insight</span>
                </div>
                <p className="text-white font-bold text-lg leading-tight italic">
                  "{activePrompt.text}"
                </p>
              </div>
            )}

            <div className="bg-black/40 backdrop-blur-2xl p-6 rounded-3xl w-full max-w-2xl border border-white/5 ring-1 ring-white/5 shadow-2xl">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Starter Question</span>
              <p className="text-white/80 font-medium italic leading-relaxed text-sm">
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
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black transition-all border border-slate-700 hover:border-slate-600"
            >
              Cancel
            </button>
            <button 
              onClick={startRecording}
              disabled={!isCameraReady}
              className="px-14 py-4 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black shadow-2xl shadow-red-600/20 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
            >
              <div className="w-4 h-4 bg-white rounded-full" />
              Start Recording
            </button>
          </>
        ) : (
          <button 
            onClick={stopRecording}
            className="px-16 py-5 bg-white text-slate-900 rounded-3xl font-black shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3 text-xl"
          >
            <div className="w-4 h-4 bg-red-600 rounded-md" />
            Finish Interview
          </button>
        )}
      </div>

      {isRecording && transcriptSnippets.length > 0 && (
        <div className="w-full max-w-3xl bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-800 ring-1 ring-slate-700/50 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">Live Transcription</h4>
          </div>
          <div className="text-sm text-slate-400 font-medium space-y-4">
            {transcriptSnippets.map((s, i) => (
              <p key={i} className={`transition-opacity duration-500 ${i === transcriptSnippets.length - 1 ? 'opacity-100 text-slate-100 italic' : 'opacity-30'}`}>
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
