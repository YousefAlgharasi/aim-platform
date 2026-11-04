// contextRef for a speaking-practice AI session: `practice:<topicId>:<attemptId>`.
// One attempt = one fresh AI chat session (the attempt id keeps sessions from being reused).

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const PRACTICE_REF = new RegExp(`^practice:(${UUID}):(${UUID})$`, 'i');

export interface PracticeContextRef {
  readonly topicId: string;
  readonly attemptId: string;
}

export function buildPracticeContextRef(topicId: string, attemptId: string): string {
  return `practice:${topicId}:${attemptId}`;
}

export function parsePracticeContextRef(contextRef: string): PracticeContextRef | null {
  const match = PRACTICE_REF.exec(contextRef);
  return match ? { topicId: match[1], attemptId: match[2] } : null;
}

export function isPracticeContextRef(contextRef: string): boolean {
  return contextRef.startsWith('practice:');
}
