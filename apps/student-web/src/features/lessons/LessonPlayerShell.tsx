import { useParams, Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './LessonPlayer.module.css';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'code' | 'callout' | 'divider';
  content: string;
  metadata?: Record<string, string>;
}

export interface LessonData {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  blocks: ContentBlock[];
  progress: number;
  prevLessonId: string | null;
  nextLessonId: string | null;
  status: 'available' | 'in_progress' | 'completed';
}

export function LessonPlayerShell() {
  const { lessonId } = useParams<{ lessonId: string }>();

  return (
    <div className={styles.shell}>
      <div className={styles.content}>
        <EmptyState
          title="Lesson content isn't available yet"
          message="The backend doesn't yet expose lesson content for viewing — only progress and completion tracking exist. Check back soon."
        />
      </div>
      <div className={styles.navBar}>
        <Link to="/curriculum" className={styles.backLink}>
          ← Back to courses
        </Link>
      </div>
    </div>
  );
}
