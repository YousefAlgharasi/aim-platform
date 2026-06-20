// P12-058: Parent Skill State UI — read-only backend-approved data.

import { useState, useEffect } from 'react';
import { getChildProgress } from '../api';
import { ParentCard, ParentBadge, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

const MASTERY_VARIANT = {
  mastered: 'success',
  progressing: 'info',
  struggling: 'warning',
  not_started: 'neutral',
};

const MASTERY_LABEL = {
  mastered: 'متقن',
  progressing: 'جاري التعلم',
  struggling: 'يحتاج دعم',
  not_started: 'لم يبدأ',
};

function ParentSkillState({ childId }) {
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildProgress(childId)
      .then((data) => {
        if (!cancelled) {
          setSkills(data?.skills || []);
          setStatus((data?.skills || []).length > 0 ? 'ready' : 'empty');
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty') return <ParentEmptyState message="لا توجد مهارات مسجلة." />;

  return (
    <div className="parent-skill-state">
      <h2 className="parent-page__title">حالة المهارات</h2>
      <div className="parent-skill-state__grid">
        {skills.map((skill) => (
          <ParentCard key={skill.skillId} title={skill.skillName}>
            <ParentBadge
              label={MASTERY_LABEL[skill.masteryLevel] || skill.masteryLevel}
              variant={MASTERY_VARIANT[skill.masteryLevel] || 'neutral'}
            />
          </ParentCard>
        ))}
      </div>
    </div>
  );
}

export default ParentSkillState;
