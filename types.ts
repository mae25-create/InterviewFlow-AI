
export type VideoLayout = '9:16' | '16:9' | '3:4' | '1:1';

export type InterviewMode = 'Quick Practice' | 'Full Mock Interview';

export type InterviewTrack = 
  | 'Behavioral' 
  | 'Product/Strategy' 
  | 'Data/Analytics' 
  | 'Leadership' 
  | 'Tell me about yourself';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  category: InterviewTrack;
  difficulty: Difficulty;
  text: string;
}

export interface AIPrompt {
  timestamp: number;
  text: string;
  id: string;
}

export interface TimedTranscript {
  text: string;
  timestamp: number;
}

export interface RecordingSession {
  blob: Blob;
  url: string;
  startTime: number;
  duration: number;
  prompts: AIPrompt[];
  transcript: string[]; 
  timedTranscript: TimedTranscript[];
  fullTranscript?: string;
  track: InterviewTrack;
  difficulty: Difficulty;
  aspectRatio: VideoLayout;
  mode: InterviewMode;
  starterQuestion: string;
  feedback?: string;
}
