import type { EngagementStatsResponse, EngagementSummaryResponse } from '../engagement/engagement.types';
import type { CurrentEnrollmentResponse } from '../enrollment/enrollment.types';
import type { ContinueLearningLesson, QuickStartLesson, RecommendedCourse } from '../lessons/lesson-progress.types';
import type { StudentDeadlinesResponse, AssessmentListItem } from '../assessments/assessment.service';
import type { RecommendationReadResponse } from '../aim/result/recommendation-read.service';
import type { ReviewScheduleReadResponse } from '../aim/result/review-schedule-read.service';
import type { StudentSkillStateReadResponse } from '../aim/result/student-skill-state-read.service';
import type { WeaknessRecordsReadResponse } from '../aim/result/weakness-records-read.service';

export const STUDENT_HOME_SECTIONS = [
  'skillStates',
  'weaknessRecords',
  'reviewSchedules',
  'recommendations',
  'engagementSummary',
  'engagementStats',
  'continueLearning',
  'quickStart',
  'recommendedCourse',
  'currentEnrollment',
  'deadlines',
  'nextAssessment',
] as const;

export type StudentHomeSection = (typeof STUDENT_HOME_SECTIONS)[number];

/**
 * Everything the student Home screen shows, in one response. Each section has
 * the exact shape of its standalone endpoint. A section that failed to load is
 * `null` and is named in `failedSections`, so clients can tell "failed" apart
 * from "empty" and still render the rest. Nothing is computed here: every value
 * comes verbatim from the same service its own endpoint uses.
 */
export interface StudentHomeResponse {
  readonly skillStates: StudentSkillStateReadResponse | null;
  readonly weaknessRecords: WeaknessRecordsReadResponse | null;
  readonly reviewSchedules: ReviewScheduleReadResponse | null;
  readonly recommendations: RecommendationReadResponse | null;
  readonly engagementSummary: EngagementSummaryResponse | null;
  readonly engagementStats: EngagementStatsResponse | null;
  readonly continueLearning: ContinueLearningLesson | null;
  readonly quickStart: QuickStartLesson | null;
  readonly recommendedCourse: RecommendedCourse | null;
  readonly currentEnrollment: CurrentEnrollmentResponse | null;
  readonly deadlines: StudentDeadlinesResponse | null;
  readonly nextAssessment: AssessmentListItem | null;
  readonly failedSections: readonly StudentHomeSection[];
}
