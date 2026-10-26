import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../i18n/I18nContext';
import type { LessonPosition, LessonRouteState } from './LessonPlayerShell';

interface LessonNavigationProps {
  position: LessonPosition;
  courseId?: string;
}

/**
 * Previous / next lesson within the chapter. Lessons are completed only via
 * practice (POST /lessons/:id/complete at the end of a practice session, as in
 * Flutter), so there is no manual "complete" button here. "Next" is enabled
 * once this lesson is completed — the backend gate requires it anyway.
 */
export function LessonNavigation({ position, courseId }: LessonNavigationProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const state: LessonRouteState = { courseId };
  const { prev, next, self } = position;
  const canGoNext = !!next && (next.completed || next.current || self?.completed === true);

  return (
    <>
      {prev ? (
        <Button variant="secondary" onClick={() => navigate(`/lessons/${prev.id}`, { state })}>
          {t('← Previous')}
        </Button>
      ) : (
        <span />
      )}

      {next ? (
        <Button
          variant="primary"
          onClick={() => navigate(`/lessons/${next.id}`, { state })}
          disabled={!canGoNext}
          title={canGoNext ? undefined : t('Complete this lesson to unlock the next one')}
        >
          {canGoNext ? t('Next lesson →') : t('🔒 Next lesson')}
        </Button>
      ) : (
        <Button variant="primary" onClick={() => navigate(courseId ? `/curriculum/${courseId}` : '/curriculum')}>
          {t('Back to course')}
        </Button>
      )}
    </>
  );
}
