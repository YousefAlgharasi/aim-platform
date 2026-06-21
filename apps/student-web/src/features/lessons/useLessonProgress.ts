import { useCallback, useRef } from 'react';
import { apiClient } from '../../api/client';

interface ProgressEvent {
  lessonId: string;
  blockId?: string;
  percent: number;
}

export function useLessonProgress(lessonId: string) {
  const lastSyncedRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const syncProgress = useCallback((event: ProgressEvent) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (event.percent <= lastSyncedRef.current) return;

      apiClient.post(`/api/lessons/${lessonId}/progress`, {
        blockId: event.blockId,
        percent: event.percent,
      }).then(() => {
        lastSyncedRef.current = event.percent;
      }).catch(() => {
        // silent fail — next sync will retry
      });
    }, 1000);
  }, [lessonId]);

  const markComplete = useCallback(() => {
    return apiClient.post(`/api/lessons/${lessonId}/complete`, {});
  }, [lessonId]);

  return { syncProgress, markComplete };
}
