import { Injectable, Logger } from '@nestjs/common';

import { RecommendationReadService } from '../aim/result/recommendation-read.service';
import { ReviewScheduleReadService } from '../aim/result/review-schedule-read.service';
import { StudentSkillStateReadService } from '../aim/result/student-skill-state-read.service';
import { WeaknessRecordsReadService } from '../aim/result/weakness-records-read.service';
import { AssessmentService } from '../assessments/assessment.service';
import { EngagementService } from '../engagement/engagement.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { LessonProgressService } from '../lessons/lesson-progress.service';
import type { SupportedLocale } from '../../common/locale/locale.constants';
import { StudentHomeResponse, StudentHomeSection } from './student-home.types';

type Settled<T> = { readonly ok: true; readonly value: T } | { readonly ok: false };

@Injectable()
export class StudentHomeService {
  private readonly logger = new Logger(StudentHomeService.name);

  constructor(
    private readonly skillStates: StudentSkillStateReadService,
    private readonly weaknessRecords: WeaknessRecordsReadService,
    private readonly reviewSchedules: ReviewScheduleReadService,
    private readonly recommendations: RecommendationReadService,
    private readonly engagement: EngagementService,
    private readonly lessonProgress: LessonProgressService,
    private readonly enrollment: EnrollmentService,
    private readonly assessments: AssessmentService,
  ) {}

  /**
   * Loads every Home section concurrently. One failing section never fails the
   * request; it comes back `null` and is listed in `failedSections`.
   * `studentId` must come from the JWT.
   */
  async getHome(studentId: string, locale: SupportedLocale): Promise<StudentHomeResponse> {
    const [
      skillStates,
      weaknessRecords,
      reviewSchedules,
      recommendations,
      engagementSummary,
      engagementStats,
      continueLearning,
      quickStart,
      recommendedCourse,
      currentEnrollment,
      deadlines,
      nextAssessment,
    ] = await Promise.all([
      this.settle('skillStates', () => this.skillStates.getSkillStatesForStudent(studentId)),
      this.settle('weaknessRecords', () => this.weaknessRecords.getWeaknessRecordsForStudent(studentId)),
      this.settle('reviewSchedules', () => this.reviewSchedules.getReviewSchedulesForStudent(studentId)),
      this.settle('recommendations', () => this.recommendations.getActiveForStudent(studentId)),
      this.settle('engagementSummary', () => this.engagement.getSummary(studentId)),
      this.settle('engagementStats', () => this.engagement.getStats(studentId)),
      this.settle('continueLearning', () => this.lessonProgress.findContinueLearningLesson(studentId, locale)),
      this.settle('quickStart', () => this.lessonProgress.findQuickStartLesson(studentId, locale)),
      this.settle('recommendedCourse', () => this.lessonProgress.findRecommendedCourse(studentId, locale)),
      this.settle('currentEnrollment', () => this.enrollment.getCurrentEnrollment(studentId, locale)),
      this.settle('deadlines', () => this.assessments.listDeadlinesForStudent(studentId)),
      this.settle('nextAssessment', () => this.assessments.getNextAssessment(studentId)),
    ]);

    const failedSections: StudentHomeSection[] = [];
    const take = <T>(section: StudentHomeSection, result: Settled<T>): T | null => {
      if (result.ok) return result.value;
      failedSections.push(section);
      return null;
    };

    return {
      skillStates: take('skillStates', skillStates),
      weaknessRecords: take('weaknessRecords', weaknessRecords),
      reviewSchedules: take('reviewSchedules', reviewSchedules),
      recommendations: take('recommendations', recommendations),
      engagementSummary: take('engagementSummary', engagementSummary),
      engagementStats: take('engagementStats', engagementStats),
      continueLearning: take('continueLearning', continueLearning),
      quickStart: take('quickStart', quickStart),
      recommendedCourse: take('recommendedCourse', recommendedCourse),
      currentEnrollment: take('currentEnrollment', currentEnrollment),
      deadlines: take('deadlines', deadlines),
      nextAssessment: take('nextAssessment', nextAssessment),
      failedSections,
    };
  }

  private async settle<T>(section: StudentHomeSection, load: () => Promise<T>): Promise<Settled<T>> {
    try {
      return { ok: true, value: await load() };
    } catch (error) {
      this.logger.warn(`Home section "${section}" failed: ${error instanceof Error ? error.message : String(error)}`);
      return { ok: false };
    }
  }
}
