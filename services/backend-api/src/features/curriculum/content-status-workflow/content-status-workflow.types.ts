export const WORKFLOW_ENTITY_TYPES = [
  'courses',
  'levels',
  'chapters',
  'lessons',
  'skills',
  'objectives',
  'questions',
] as const;

export type WorkflowEntityType = (typeof WORKFLOW_ENTITY_TYPES)[number];

export const ENTITY_TABLE: Record<WorkflowEntityType, string> = {
  courses: 'courses',
  levels: 'levels',
  chapters: 'chapters',
  lessons: 'lessons',
  skills: 'skills',
  objectives: 'objectives',
  questions: 'question_bank',
};

export interface StatusRow {
  id: string;
  status: string;
  updated_at: string;
}

export interface StatusTransitionResult {
  id: string;
  entityType: WorkflowEntityType;
  previousStatus: string;
  currentStatus: string;
  updatedAt: string;
}
