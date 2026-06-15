// Phase 3 — P3-042
// Question-skill mapping types.
//
// Source of truth: packages/shared-contracts/api/question-bank-contracts.md
// (Section 7, Skill Mapping) and the question_skills migration (P3-027).

export interface QuestionSkillRow {
  question_id: string;
  skill_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface QuestionSkillLink {
  questionId: string;
  skillId: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface QuestionSkillListResponse {
  links: QuestionSkillLink[];
  total: number;
}

export interface AddSkillToQuestionInput {
  skillId: string;
  isPrimary?: boolean;
}
