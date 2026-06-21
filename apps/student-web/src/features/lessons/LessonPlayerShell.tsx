import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { LessonNavigation } from './LessonNavigation';
import type { ApiError } from '../../types';
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
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchLesson() {
    setLoading(true);
    setError('');
    apiClient.get<LessonData>(`/api/lessons/${lessonId}`)
      .then(setLesson)
      .catch((err: ApiError) => setError(err.message || 'Failed to load lesson'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchLesson(); }, [lessonId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchLesson} />;
  if (!lesson) return null;

  return (
    <div className={styles.shell}>
      <div className={styles.topBar}>
        <Link to={`/curriculum/${lesson.subjectId}`} className={styles.backLink}>
          ← {lesson.subjectName}
        </Link>
        <h1 className={styles.lessonTitle}>{lesson.title}</h1>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${lesson.progress}%` }}
          role="progressbar"
          aria-valuenow={lesson.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Lesson progress"
        />
      </div>

      <div className={styles.content}>
        {lesson.blocks.map(block => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
      </div>

      <div className={styles.navBar}>
        <LessonNavigation lesson={lesson} onStatusChange={fetchLesson} />
      </div>
    </div>
  );
}
