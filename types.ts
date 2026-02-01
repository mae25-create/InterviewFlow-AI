
export type VideoLayout = '9:16' | '16:9' | '3:4' | '1:1';

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
  text: string;
}

export interface AIPrompt {
  timestamp: number;
  text: string;
  id: string;
}

export interface RecordingSession {
  blob: Blob;
  url: string;
  startTime: number;
  duration: number;
  prompts: AIPrompt[];
  transcript: string[]; // This stores chunks of recognized text
  fullTranscript?: string; // Compiled text for AI analysis
  track: InterviewTrack;
  difficulty: Difficulty;
  aspectRatio: VideoLayout;
  starterQuestion: string;
  feedback?: string;
}
