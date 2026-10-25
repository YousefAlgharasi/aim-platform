import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import type {
  ContinueLearningLesson,
  CurrentEnrollment,
  QuickStartLesson,
  RecommendedCourse,
} from '../dashboardApi';
import styles from './Widgets.module.css';

interface ContinueWidgetProps {
  continueLesson: ContinueLearningLesson | null;
  quickStart: QuickStartLesson | null;
  recommendedCourse: RecommendedCourse | null;
  enrollment: CurrentEnrollment | null;
}

/** "Continue learning" hero: resume lesson → quick-start lesson → current/recommended course → placement. */
export function ContinueWidget({ continueLesson, quickStart, recommendedCourse, enrollment }: ContinueWidgetProps) {
  const enrolledCourse =
    enrollment?.found && enrollment.courseId
      ? { id: enrollment.courseId, title: enrollment.courseTitle ?? 'Your course' }
      : null;
  const course = enrolledCourse ?? (recommendedCourse
    ? { id: recommendedCourse.courseId, title: recommendedCourse.courseTitle }
    : null);

  if (!continueLesson && !quickStart && !course) {
    return (
      <Card>
        <EmptyState
          title="Find your starting point"
          message="Take the placement test so we can recommend a course and your first lesson."
        />
        <div className={styles.actionsRow}>
          <Link to="/placement" className={styles.primaryLink}>Take the placement test</Link>
          <Link to="/curriculum" className={styles.viewAll}>Browse courses</Link>
        </div>
      </Card>
    );
  }

  const pct = continueLesson ? Math.min(100, Math.max(0, Math.round(continueLesson.percent))) : 0;

  return (
    <Card>
      <div className={styles.listWidget}>
        {continueLesson ? (
          <>
            <span className={styles.recType}>Continue learning</span>
            <span className={styles.heroTitle}>{continueLesson.lessonTitle}</span>
            <div
              className={styles.bar}
              role="progressbar"
              aria-label="Lesson progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className={styles.barFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.widgetMeta}>{pct}% complete</span>
            <div className={styles.actionsRow}>
              <Link to={`/lessons/${continueLesson.lessonId}`} className={styles.primaryLink}>Resume lesson</Link>
            </div>
          </>
        ) : quickStart ? (
          <>
            <span className={styles.recType}>
              Start here{quickStart.skillName ? ` · ${quickStart.skillName}` : ''}
            </span>
            <span className={styles.heroTitle}>{quickStart.lessonTitle}</span>
            {quickStart.lessonDescription && <span className={styles.recReason}>{quickStart.lessonDescription}</span>}
            <div className={styles.actionsRow}>
              <Link to={`/lessons/${quickStart.lessonId}`} className={styles.primaryLink}>Start lesson</Link>
            </div>
          </>
        ) : null}

        {course && (
          <div className={styles.courseRow}>
            <div className={styles.widgetContent}>
              <span className={styles.widgetLabel}>{enrolledCourse ? 'Current course' : 'Recommended course'}</span>
              <span className={styles.recName}>{course.title}</span>
              {!enrolledCourse && recommendedCourse?.estimatedLevel && (
                <span className={styles.recReason}>Level: {recommendedCourse.estimatedLevel}</span>
              )}
            </div>
            <Link to={`/curriculum/${course.id}`} className={styles.viewAll}>Open course</Link>
          </div>
        )}
      </div>
    </Card>
  );
}
