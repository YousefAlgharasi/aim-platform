// Question answer-choice types.
//
// Source of truth: packages/shared-contracts/api/question-bank-contracts.md
// (P3-014, Section 5) and the `question_choices` table
// (services/backend-api/prisma/migrations/20260614060000_create_question_bank_table).
//
// is_correct is admin-facing only. Never return QuestionChoiceRow /
// QuestionChoice from a student-facing / question-delivery endpoint.

export interface QuestionChoiceRow {
  id: string;
  question_id: string;
  text: string;
  rich_text: unknown | null;
  is_correct: boolean;
  sort_order: number;
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionChoice {
  id: string;
  questionId: string;
  text: string;
  richText: unknown | null;
  isCorrect: boolean;
  order: number;
  explanation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionChoiceListResponse {
  choices: QuestionChoice[];
  total: number;
}

export interface ReorderQuestionChoicesInput {
  orderedChoiceIds: string[];
}
