import { AiTeacherHookType } from './ai-teacher.constants';

export interface AiTeacherContext {
  hookType: AiTeacherHookType;
  skillId: string;
  lessonId: string;
  questionId: string | null;
  blockContent: string;
  studentAnswer: string | null;
  correctAnswer: string | null;
  studentMastery: number;
  studentFrustrationScore: number;
  priorAiResponsesThisBlock: string[];
  sessionInvocationCount: number;
}

export interface AiTeacherResponse {
  explanation: string;
  isFallback: boolean;
  validationPassed: boolean;
}

export interface AiTeacherInvocationRecord {
  sessionId: string;
  studentId: string;
  skillId: string;
  questionId: string | null;
  hookType: AiTeacherHookType;
  invocationPositionInSession: number;
}
