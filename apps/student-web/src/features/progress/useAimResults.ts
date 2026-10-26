import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { fetchAimResults, type AimResults } from './aimApi';

/**
 * Loads all read-only AIM outputs for the signed-in student.
 * studentId = useAuth().user.id (the JWT/Supabase uid that StudentOwnershipGuard checks),
 * matching Flutter's `authContext.user.id`.
 */
export function useAimResults() {
  const { user } = useAuth();
  const { t } = useI18n();
  const studentId = user?.id;
  const [data, setData] = useState<AimResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      setError(t('Your session is missing a student account.'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      setData(await fetchAimResults(studentId));
    } catch (err) {
      setError(getErrorMessage(err, t('Could not load your progress.')));
    } finally {
      setLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
