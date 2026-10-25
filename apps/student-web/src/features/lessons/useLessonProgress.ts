import { useCallback, useRef } from 'react';
import { completeLesson, recordLessonProgress } from './lessonsApi';

/**
 * Lesson progress writes, matching Flutter's practice-session persistence:
 *  - syncProgress: POST /lessons/:id/progress { percent } (backend clamps and keeps the max)
 *  - markComplete: POST /lessons/:id/progress { percent: 100 } then POST /lessons/:id/complete
 * Both may reject with 403 when the unlock gate (previous lesson / locked course) applies.
 */
export function useLessonProgress(lessonId: string) {
  const lastSyncedRef = useRef(0);

  const syncProgress = useCallback((percent: number) => {
    const safe = Math.min(Math.max(Math.round(percent), 0), 100);
    if (safe <= lastSyncedRef.current) return Promise.resolve();
    return recordLessonProgress(lessonId, safe)
      .then(() => { lastSyncedRef.current = safe; })
      .catch(() => {
        // Best effort, like Flutter: the next update or completion retries.
      });
  }, [lessonId]);

  const markComplete = useCallback(async () => {
    await recordLessonProgress(lessonId, 100);
    const ack = await completeLesson(lessonId);
    lastSyncedRef.current = 100;
    return ack;
  }, [lessonId]);

  return { syncProgress, markComplete };
}
