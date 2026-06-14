export interface LessonSkillRow {
  lesson_id: string;
  skill_id: string;
  created_at: string;
}

export interface LessonSkillLink {
  lessonId: string;
  skillId: string;
  createdAt: string;
}

export interface LessonSkillListResponse {
  links: LessonSkillLink[];
  total: number;
}

export interface AddSkillToLessonInput {
  skillId: string;
}
