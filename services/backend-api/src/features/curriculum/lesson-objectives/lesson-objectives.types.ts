export interface LessonObjectiveRow {
  lesson_id: string;
  objective_id: string;
  created_at: string;
}

export interface LessonObjectiveLink {
  lessonId: string;
  objectiveId: string;
  createdAt: string;
}

export interface LessonObjectiveListResponse {
  links: LessonObjectiveLink[];
  total: number;
}

export interface AddObjectiveToLessonInput {
  objectiveId: string;
}
