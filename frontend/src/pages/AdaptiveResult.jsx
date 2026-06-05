import { useMemo, useState } from 'react';
import {
  API_BASE_URL,
  clearLastStoredAdaptiveResult,
  getLastStoredAdaptiveResult,
  getPilotAdaptiveResult,
} from '../shared/api/client';

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'None';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function formatLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getQueryValue(name, fallback = '') {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return new URLSearchParams(window.location.search).get(name) || fallback;
}

function isDebugEnabled() {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return (
    params.get('debug') === '1' ||
    params.get('admin') === '1' ||
    window.localStorage.getItem('aim_debug_enabled') === 'true'
  );
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return 'No review date yet';
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPrimaryResult(result) {
  if (!result) {
    return {};
  }

  if (Array.isArray(result.adaptive_results) && result.adaptive_results.length > 0) {
    return result.adaptive_results[0] || {};
  }

  return result;
}

function getRecommendationTitle(recommendation, difficultyDecision, retentionResult, weaknessResult) {
  const actionText = `${recommendation.action || ''} ${recommendation.action_type || ''} ${difficultyDecision.action || ''}`.toLowerCase();
  const weaknessScore = toNumber(weaknessResult.weakness_score, 0);

  if (toNumber(retentionResult.review_priority, 0) >= 70 || retentionResult.is_due) {
    return 'Review this skill now';
  }

  if (actionText.includes('prerequisite')) {
    return 'Review the missing prerequisite first';
  }

  if (actionText.includes('reteach') || actionText.includes('review')) {
    return 'Do a guided review';
  }

  if (actionText.includes('challenge') || actionText.includes('increase')) {
    return 'Move to a stronger challenge';
  }

  if (actionText.includes('mixed')) {
    return 'Practice mixed questions';
  }

  if (actionText.includes('easy') || actionText.includes('support')) {
    return 'Start with an easier win';
  }

  if (weaknessScore >= 60) {
    return 'Strengthen the weak point first';
  }

  return 'Continue with the next practice step';
}

function getReviewMessage(retentionResult) {
  if (!retentionResult || Object.keys(retentionResult).length === 0) {
    return 'No spaced review action is available yet.';
  }

  if (retentionResult.is_due) {
    return 'Review is due now. Start with a short recap before the next lesson.';
  }

  if (retentionResult.due_at) {
    return `Next review is scheduled for ${formatDate(retentionResult.due_at)}.`;
  }

  return `Review priority is ${formatValue(retentionResult.review_priority)}.`;
}

function normalizeAdaptiveResult(result) {
  const primary = getPrimaryResult(result);
  const mastery = primary.mastery_result || {};
  const state = primary.updated_skill_state || {};
  const weakness = primary.weakness_result || {};
  const recommendation = primary.recommendation || {};
  const retention = primary.retention_result || {};
  const difficulty = primary.difficulty_decision || {};
  const emotional = primary.safe_emotional_signal || {};
  const prompt = primary.prompt_adaptation_instruction || {};
  const performance = primary.performance_metrics || {};

  const masteryNow = toNumber(
    mastery.mastery ?? mastery.final_mastery ?? state.mastery,
    0,
  );
  const masteryBefore = toNumber(
    mastery.previous_mastery ?? state.previous_mastery,
    0,
  );
  const masteryDelta = masteryNow - masteryBefore;
  const weaknessScore = toNumber(weakness.weakness_score, 0);
  const frustrationScore = toNumber(emotional.frustration_score, 0);
  const accuracy = toNumber(performance.accuracy ?? mastery.accuracy_score, 0);

  const mainWeaknesses = Array.isArray(weakness.main_weaknesses)
    ? weakness.main_weaknesses
    : [];

  return {
    primary,
    mastery,
    state,
    weakness,
    recommendation,
    retention,
    difficulty,
    emotional,
    prompt,
    performance,
    masteryNow,
    masteryBefore,
    masteryDelta,
    weaknessScore,
    frustrationScore,
    accuracy,
    mainWeaknesses,
    nextActionTitle: getRecommendationTitle(recommendation, difficulty, retention, weakness),
    reviewMessage: getReviewMessage(retention),
  };
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`adaptive-result-badge adaptive-result-badge--${tone}`}>{children}</span>;
}

function MetricCard({ label, value, helper, tone = 'blue' }) {
  return (
    <section className={`adaptive-result-card adaptive-result-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </section>
  );
}

function Meter({ label, value, helper }) {
  const numeric = Math.max(0, Math.min(100, toNumber(value, 0)));

  return (
    <div className="adaptive-result-meter">
      <div>
        <span>{label}</span>
        <strong>{formatValue(numeric)}%</strong>
      </div>
      <div className="adaptive-result-meter__track">
        <span style={{ width: `${numeric}%` }} />
      </div>
      {helper && <p>{helper}</p>}
    </div>
  );
}

function EmptyState({ onLoadSaved }) {
  return (
    <section className="adaptive-result-empty">
      <h2>No adaptive result loaded</h2>
      <p>
        Enter a student ID and session ID to fetch the saved AIM result, or load the latest result saved by the lesson session page.
      </p>
      <button type="button" onClick={onLoadSaved}>
        Load Latest Saved Result
      </button>
    </section>
  );
}

function StudentResultView({ summary }) {
  const {
    masteryNow,
    masteryBefore,
    masteryDelta,
    weaknessScore,
    frustrationScore,
    accuracy,
    mainWeaknesses,
    nextActionTitle,
    reviewMessage,
    recommendation,
    retention,
    difficulty,
    prompt,
    emotional,
  } = summary;

  const progressTone = masteryDelta >= 0 ? 'green' : 'amber';
  const weaknessTone = weaknessScore >= 65 ? 'red' : weaknessScore >= 35 ? 'amber' : 'green';
  const frustrationTone = frustrationScore >= 70 ? 'red' : frustrationScore >= 40 ? 'amber' : 'green';

  return (
    <>
      <section className="adaptive-result-hero">
        <div>
          <p>Your next step</p>
          <h2>{nextActionTitle}</h2>
          <span>
            {recommendation.reason ||
              difficulty.reason ||
              'AIM has prepared the next learning step based on your latest session.'}
          </span>
        </div>
        <Badge tone="purple">
          {formatLabel(recommendation.action || recommendation.action_type || difficulty.action || 'Next action')}
        </Badge>
      </section>

      <section className="adaptive-result-grid">
        <MetricCard
          label="Current progress"
          value={`${formatValue(masteryNow)}%`}
          helper={`Before this session: ${formatValue(masteryBefore)}%`}
          tone={progressTone}
        />
        <MetricCard
          label="Progress change"
          value={`${masteryDelta >= 0 ? '+' : ''}${formatValue(masteryDelta)}%`}
          helper={masteryDelta >= 0 ? 'Your mastery improved or stayed stable.' : 'AIM will slow down and support review.'}
          tone={progressTone}
        />
        <MetricCard
          label="Accuracy"
          value={`${formatValue(accuracy)}%`}
          helper="Based on this skill's recorded attempts."
          tone={accuracy >= 75 ? 'green' : accuracy >= 45 ? 'amber' : 'red'}
        />
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>Focus area</p>
            <h2>What to improve next</h2>
          </div>
          <Badge tone={weaknessTone}>Weakness {formatValue(weaknessScore)}%</Badge>
        </div>

        <div className="adaptive-result-focus">
          <Meter
            label="Weakness score"
            value={weaknessScore}
            helper={
              weaknessScore >= 65
                ? 'This skill needs focused support.'
                : weaknessScore >= 35
                  ? 'There are some points to strengthen.'
                  : 'No major weakness was detected.'
            }
          />

          <div className="adaptive-result-list">
            {mainWeaknesses.length > 0 ? (
              mainWeaknesses.map((weakness) => (
                <div key={weakness}>
                  <strong>{formatLabel(weakness)}</strong>
                  <span>Practice this point before increasing difficulty.</span>
                </div>
              ))
            ) : (
              <div>
                <strong>No major weakness detected</strong>
                <span>Continue practice and keep building consistency.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>Recommendation</p>
            <h2>What the student should do</h2>
          </div>
          <Badge tone="purple">
            {formatLabel(recommendation.action_type || recommendation.action || 'Practice')}
          </Badge>
        </div>

        <div className="adaptive-result-action-grid">
          <div>
            <span>Target skill</span>
            <strong>{formatValue(recommendation.target_skill_id || recommendation.skill_id)}</strong>
          </div>
          <div>
            <span>Difficulty</span>
            <strong>{formatValue(recommendation.difficulty || difficulty.target_difficulty)}</strong>
          </div>
          <div>
            <span>Priority</span>
            <strong>{formatValue(recommendation.decision_priority || 'Normal')}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{formatValue(recommendation.confidence)}</strong>
          </div>
        </div>

        {prompt.instruction_text && (
          <div className="adaptive-result-teacher-note">
            <strong>Teacher guidance</strong>
            <p>{prompt.instruction_text}</p>
          </div>
        )}
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>Review action</p>
            <h2>Spaced review plan</h2>
          </div>
          <Badge tone={retention.is_due ? 'red' : 'blue'}>
            {retention.is_due ? 'Due now' : 'Scheduled'}
          </Badge>
        </div>

        <div className="adaptive-result-review">
          <p>{reviewMessage}</p>
          <div className="adaptive-result-action-grid">
            <div>
              <span>Retention</span>
              <strong>{formatValue(retention.retention)}%</strong>
            </div>
            <div>
              <span>Review priority</span>
              <strong>{formatValue(retention.review_priority)}</strong>
            </div>
            <div>
              <span>Due at</span>
              <strong>{formatDate(retention.due_at)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>Learning comfort</p>
            <h2>Support level</h2>
          </div>
          <Badge tone={frustrationTone}>
            {formatLabel(emotional.emotional_signal || 'Stable')}
          </Badge>
        </div>

        <div className="adaptive-result-focus">
          <Meter
            label="Frustration signal"
            value={frustrationScore}
            helper={
              frustrationScore >= 70
                ? 'Use easier steps and encouragement.'
                : frustrationScore >= 40
                  ? 'Use calm guidance and short practice.'
                  : 'The student can continue normally.'
            }
          />

          <div className="adaptive-result-teacher-note">
            <strong>Teaching tone</strong>
            <p>
              {frustrationScore >= 70
                ? 'Encourage the student, reduce pressure, and start with a small success.'
                : frustrationScore >= 40
                  ? 'Keep the lesson calm and check understanding after each question.'
                  : 'Use a confident and motivating tone.'}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function AdaptiveResult() {
  const initialStored = getLastStoredAdaptiveResult();
  const [studentId, setStudentId] = useState(() =>
    getQueryValue('studentId', initialStored?.meta?.studentId || '1'),
  );
  const [sessionId, setSessionId] = useState(() =>
    getQueryValue('sessionId', initialStored?.meta?.sessionId || ''),
  );
  const [result, setResult] = useState(() => initialStored?.result || null);
  const [source, setSource] = useState(() => (initialStored?.result ? 'Latest saved result' : 'No result loaded'));
  const [status, setStatus] = useState(() => (initialStored?.result ? 'Saved result loaded' : 'Ready'));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(() => isDebugEnabled());

  const summary = useMemo(() => normalizeAdaptiveResult(result), [result]);

  async function handleFetchResult() {
    if (!studentId || !sessionId) {
      setError('Student ID and session ID are required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('Loading adaptive result');

    try {
      const data = await getPilotAdaptiveResult(studentId, sessionId);
      setResult(data);
      setSource('Backend adaptive result');
      setStatus('Adaptive result loaded');
    } catch (requestError) {
      setError(`Could not load adaptive result: ${requestError.message}`);
      setStatus('Load failed');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoadSavedResult() {
    const stored = getLastStoredAdaptiveResult();

    if (!stored?.result) {
      setError('No saved adaptive result was found in this browser.');
      setStatus('No saved result');
      return;
    }

    setResult(stored.result);
    setStudentId(stored.meta?.studentId || studentId);
    setSessionId(stored.meta?.sessionId || sessionId);
    setSource('Latest saved result');
    setError('');
    setStatus('Saved result loaded');
  }

  function handleClearSavedResult() {
    clearLastStoredAdaptiveResult();
    setResult(null);
    setSource('No result loaded');
    setStatus('Saved result cleared');
    setError('');
  }

  function handleDebugToggle() {
    const nextValue = !debugEnabled;
    setDebugEnabled(nextValue);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aim_debug_enabled', nextValue ? 'true' : 'false');
    }
  }

  return (
    <main className="adaptive-result">
      <style>{styles}</style>

      <header className="adaptive-result-header">
        <div>
          <p>AIM Web Pilot</p>
          <h1>Adaptive result</h1>
          <span>Student-friendly progress, weakness, recommendation, and review action.</span>
        </div>
        <div className="adaptive-result-header__badges">
          <Badge tone="blue">{API_BASE_URL}</Badge>
          <Badge tone={error ? 'red' : result ? 'green' : 'amber'}>{status}</Badge>
        </div>
      </header>

      <section className="adaptive-result-toolbar">
        <label>
          <span>Student ID</span>
          <input
            type="number"
            min="1"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
        </label>

        <label>
          <span>Session ID</span>
          <input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            placeholder="lesson-id:session-token"
          />
        </label>

        <button type="button" onClick={handleFetchResult} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Result'}
        </button>

        <button type="button" onClick={handleLoadSavedResult}>
          Load Saved
        </button>

        <button type="button" onClick={handleClearSavedResult}>
          Clear Saved
        </button>
      </section>

      {error && (
        <section className="adaptive-result-error" role="alert">
          {error}
        </section>
      )}

      <section className="adaptive-result-source">
        <div>
          <span>Source</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>Student</span>
          <strong>{studentId || 'Not selected'}</strong>
        </div>
        <div>
          <span>Session</span>
          <strong>{sessionId || result?.session_id || 'Not selected'}</strong>
        </div>
        <div>
          <span>Attempts saved</span>
          <strong>{formatValue(result?.attempts_saved)}</strong>
        </div>
      </section>

      {!result ? (
        <EmptyState onLoadSaved={handleLoadSavedResult} />
      ) : (
        <StudentResultView summary={summary} />
      )}

      <section className="adaptive-result-debug-control">
        <button type="button" onClick={handleDebugToggle}>
          {debugEnabled ? 'Hide Debug/Admin Data' : 'Show Debug/Admin Data'}
        </button>
        <p>
          Technical AIM fields are hidden from students by default. Enable this only for developer/admin review.
        </p>
      </section>

      {debugEnabled && result && (
        <section className="adaptive-result-panel adaptive-result-debug">
          <div className="adaptive-result-panel__header">
            <div>
              <p>Debug/Admin</p>
              <h2>Raw AIM response</h2>
            </div>
            <Badge tone="red">Technical</Badge>
          </div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}

const styles = `
.adaptive-result {
  background: #f5f7fb;
  color: #172328;
  min-height: 100vh;
  padding: 28px;
}

.adaptive-result-header,
.adaptive-result-toolbar,
.adaptive-result-source,
.adaptive-result-empty,
.adaptive-result-hero,
.adaptive-result-grid,
.adaptive-result-panel,
.adaptive-result-error,
.adaptive-result-debug-control {
  margin-left: auto;
  margin-right: auto;
  max-width: 1240px;
}

.adaptive-result-header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.adaptive-result-header p,
.adaptive-result-hero p,
.adaptive-result-panel__header p {
  color: #3f6f78;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.adaptive-result-header h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
  margin: 0 0 10px;
}

.adaptive-result-header span,
.adaptive-result-empty p,
.adaptive-result-debug-control p {
  color: #64748b;
  display: block;
  font-weight: 700;
}

.adaptive-result-header__badges {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  max-width: 560px;
}

.adaptive-result-toolbar,
.adaptive-result-source,
.adaptive-result-empty,
.adaptive-result-hero,
.adaptive-result-card,
.adaptive-result-panel,
.adaptive-result-error,
.adaptive-result-debug-control {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(31, 57, 87, 0.08);
}

.adaptive-result-toolbar {
  align-items: end;
  display: grid;
  gap: 14px;
  grid-template-columns: 130px minmax(260px, 1fr) repeat(3, auto);
  margin-bottom: 16px;
  padding: 16px;
}

.adaptive-result-toolbar label {
  display: grid;
  gap: 8px;
}

.adaptive-result-toolbar span,
.adaptive-result-source span,
.adaptive-result-card span,
.adaptive-result-meter span,
.adaptive-result-action-grid span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.adaptive-result-toolbar input {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #172328;
  min-height: 44px;
  padding: 0 12px;
  width: 100%;
}

.adaptive-result-toolbar button,
.adaptive-result-empty button,
.adaptive-result-debug-control button {
  background: #eaf2ff;
  border: 0;
  border-radius: 10px;
  color: #164da8;
  cursor: pointer;
  font-weight: 900;
  min-height: 44px;
  padding: 0 14px;
}

.adaptive-result-toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.adaptive-result-error {
  color: #b91c1c;
  font-weight: 800;
  margin-bottom: 16px;
  padding: 14px 16px;
}

.adaptive-result-source {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 16px;
  overflow: hidden;
}

.adaptive-result-source > div {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.adaptive-result-source strong {
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.adaptive-result-empty {
  padding: 32px;
  text-align: center;
}

.adaptive-result-empty h2 {
  font-size: 2rem;
  margin: 0 0 10px;
}

.adaptive-result-empty button {
  margin-top: 18px;
}

.adaptive-result-hero {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 28px;
}

.adaptive-result-hero h2 {
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 1.05;
  margin: 0 0 10px;
}

.adaptive-result-hero span {
  color: #475569;
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.55;
  max-width: 760px;
}

.adaptive-result-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 16px;
}

.adaptive-result-card {
  border-top: 6px solid #2563eb;
  display: grid;
  gap: 8px;
  padding: 18px;
}

.adaptive-result-card--green {
  border-top-color: #16a34a;
}

.adaptive-result-card--amber {
  border-top-color: #d97706;
}

.adaptive-result-card--red {
  border-top-color: #dc2626;
}

.adaptive-result-card--purple {
  border-top-color: #7c3aed;
}

.adaptive-result-card strong {
  font-size: 2rem;
  line-height: 1;
}

.adaptive-result-card p {
  color: #64748b;
  font-weight: 700;
  line-height: 1.45;
  margin: 0;
}

.adaptive-result-panel {
  margin-bottom: 16px;
  padding: 22px;
}

.adaptive-result-panel__header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 18px;
}

.adaptive-result-panel__header h2 {
  line-height: 1.2;
  margin: 0;
}

.adaptive-result-focus {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
}

.adaptive-result-meter {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: grid;
  gap: 10px;
  padding: 14px;
}

.adaptive-result-meter > div:first-child {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.adaptive-result-meter strong {
  font-size: 1.2rem;
}

.adaptive-result-meter__track {
  background: #e6edf5;
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
}

.adaptive-result-meter__track span {
  background: #2563eb;
  display: block;
  height: 100%;
}

.adaptive-result-meter p {
  color: #64748b;
  font-weight: 700;
  line-height: 1.45;
  margin: 0;
}

.adaptive-result-list {
  display: grid;
  gap: 10px;
}

.adaptive-result-list > div,
.adaptive-result-teacher-note,
.adaptive-result-review {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: grid;
  gap: 8px;
  padding: 14px;
}

.adaptive-result-list strong,
.adaptive-result-teacher-note strong {
  color: #172328;
}

.adaptive-result-list span,
.adaptive-result-teacher-note p,
.adaptive-result-review p {
  color: #64748b;
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
}

.adaptive-result-action-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.adaptive-result-action-grid > div {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: grid;
  gap: 8px;
  padding: 14px;
}

.adaptive-result-action-grid strong {
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.adaptive-result-teacher-note {
  margin-top: 14px;
}

.adaptive-result-review {
  gap: 16px;
}

.adaptive-result-badge {
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 900;
  line-height: 1.1;
  padding: 8px 10px;
}

.adaptive-result-badge--blue {
  background: #eef4ff;
  border-color: #bfdbfe;
  color: #164da8;
}

.adaptive-result-badge--green {
  background: #ecfdf5;
  border-color: #86efac;
  color: #166534;
}

.adaptive-result-badge--amber {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.adaptive-result-badge--red {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.adaptive-result-badge--purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
  color: #5b21b6;
}

.adaptive-result-debug-control {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 16px;
}

.adaptive-result-debug-control p {
  margin: 0;
}

.adaptive-result-debug pre {
  background: #101820;
  border-radius: 12px;
  color: #dbeafe;
  font-size: 0.78rem;
  line-height: 1.45;
  max-height: 560px;
  overflow: auto;
  padding: 16px;
}

@media (max-width: 1080px) {
  .adaptive-result-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .adaptive-result-grid,
  .adaptive-result-source,
  .adaptive-result-focus,
  .adaptive-result-action-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .adaptive-result {
    padding: 16px;
  }

  .adaptive-result-header,
  .adaptive-result-hero,
  .adaptive-result-panel__header,
  .adaptive-result-debug-control {
    align-items: flex-start;
    flex-direction: column;
  }

  .adaptive-result-header__badges {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .adaptive-result-toolbar {
    grid-template-columns: 1fr;
  }
}
`;

export default AdaptiveResult;