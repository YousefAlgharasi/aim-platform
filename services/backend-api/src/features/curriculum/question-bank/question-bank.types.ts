export const QUESTION_TYPES = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'fill_in_the_blank',
  'short_answer',
  'ordering',
  'matching',
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIFFICULTIES = [
  'beginner',
  'elementary',
  'intermediate',
  'upper_intermediate',
  'advanced',
] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const QUESTION_STATUSES = ['draft', 'published', 'archived'] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export interface QuestionBankRow {
  id: string;
  type: QuestionType;
  stem: string;
  rich_stem: unknown | null;
  difficulty: QuestionDifficulty;
  explanation: string | null;
  hint: string | null;
  tags: string[];
  status: QuestionStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankSummary {
  id: string;
  type: QuestionType;
  stem: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  status: QuestionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBankDetail extends QuestionBankSummary {
  richStem: unknown | null;
  explanation: string | null;
  hint: string | null;
}

export interface QuestionBankListResponse {
  questions: QuestionBankSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateQuestionInput {
  type: QuestionType;
  stem: string;
  difficulty: QuestionDifficulty;
  richStem?: unknown | null;
  explanation?: string | null;
  hint?: string | null;
  tags?: string[];
  createdBy: string;
}

export interface UpdateQuestionInput {
  stem?: string;
  difficulty?: QuestionDifficulty;
  richStem?: unknown | null;
  explanation?: string | null;
  hint?: string | null;
  tags?: string[];
}
