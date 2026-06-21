import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import styles from './CourseDetail.module.css';

interface Lesson {
  id: string;
  name: string;
  duration: string;
  status: 'completed' | 'current' | 'available' | 'locked';
}

interface Chapter {
  id: string;
  title: string;
  completedCount: number;
  totalCount: number;
  lessons: Lesson[];
}

interface ChapterLessonListProps {
  chapters: Chapter[];
}

function getIconClass(status: Lesson['status']) {
  switch (status) {
    case 'completed': return styles.iconCompleted;
    case 'current': return styles.iconCurrent;
    case 'locked': return styles.iconLocked;
    default: return styles.iconDefault;
  }
}

function getIconSymbol(status: Lesson['status']) {
  switch (status) {
    case 'completed': return '✓';
    case 'current': return '▶';
    case 'locked': return '🔒';
    default: return '○';
  }
}

export function ChapterLessonList({ chapters }: ChapterLessonListProps) {
  return (
    <div className={styles.chapterList}>
      {chapters.map(chapter => (
        <Card key={chapter.id}>
          <div className={styles.chapterCard}>
            <div className={styles.chapterHeader}>
              <h2 className={styles.chapterTitle}>{chapter.title}</h2>
              <span className={styles.chapterProgress}>
                {chapter.completedCount}/{chapter.totalCount}
              </span>
            </div>
            <div className={styles.lessonList} role="list">
              {chapter.lessons.map(lesson => {
                const isLocked = lesson.status === 'locked';
                const content = (
                  <>
                    <span className={`${styles.lessonIcon} ${getIconClass(lesson.status)}`} aria-hidden="true">
                      {getIconSymbol(lesson.status)}
                    </span>
                    <div className={styles.lessonInfo}>
                      <span className={styles.lessonName}>{lesson.name}</span>
                      <span className={styles.lessonDuration}>{lesson.duration}</span>
                    </div>
                    {lesson.status === 'completed' && (
                      <span className={`${styles.statusBadge} ${styles.badgeCompleted}`}>Done</span>
                    )}
                    {lesson.status === 'current' && (
                      <span className={`${styles.statusBadge} ${styles.badgeCurrent}`}>Current</span>
                    )}
                  </>
                );

                if (isLocked) {
                  return (
                    <div key={lesson.id} className={`${styles.lessonItem} ${styles.lessonLocked}`} role="listitem" aria-disabled="true">
                      {content}
                    </div>
                  );
                }

                return (
                  <Link key={lesson.id} to={`/lessons/${lesson.id}`} className={styles.lessonItem} role="listitem">
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
