import { VoiceTurnStatus } from './voice-teacher.constants';

export interface VoiceSessionRecord {
  sessionId: string;
  studentId: string;
  contextRef: string;
  createdAt: string;
}

export interface VoiceTurnRecord {
  turnId: string;
  sessionId: string;
  transcript: string | null;
  reply: string | null;
  audioRef: string | null;
  status: VoiceTurnStatus;
  createdAt: string;
}
