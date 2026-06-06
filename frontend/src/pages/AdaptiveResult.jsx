import { useMemo, useState } from 'react';
import {
  API_BASE_URL,
  clearLastStoredAdaptiveResult,
  getLastStoredAdaptiveResult,
  getPilotAdaptiveResult,
} from '../shared/api/client';

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'غير متوفر';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا';
  }

  return String(value);
}

const ARABIC_VALUE_LABELS = {
  collect_more_evidence: 'جمع أدلة أكثر',
  high_frustration_or_overload: 'تبسيط الخطوة التالية',
  increase_difficulty: 'رفع مستوى الصعوبة تدريجيا',
  decrease_difficulty: 'تخفيف مستوى الصعوبة',
  maintain_difficulty: 'الاستمرار على نفس المستوى',
  continue_current_skill: 'متابعة المهارة الحالية',
  review: 'مراجعة قصيرة',
  reteach: 'شرح موجه',
  reteach_concept: 'إعادة شرح المفهوم',
  challenge: 'تحد مناسب',
  easy_win: 'بداية سهلة داعمة',
  confidence_builder: 'نشاط يعزز الثقة',
  timed_practice: 'تدريب طلاقة بدون ضغط',
  mixed_practice: 'تدريب متنوع',
  prerequisite: 'متطلب سابق',
  stable: 'مستقر',
  due_now: 'حان وقت المراجعة',
  scheduled: 'مجدولة',
  normal: 'عادية',
  low: 'منخفض',
  medium: 'متوسط',
  high: 'مرتفع',
  increase: 'زيادة',
  decrease: 'تخفيف',
  maintain: 'ثبات',
};

function formatLabel(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return 'غير متوفر';
  }

  const normalized = raw.replaceAll('-', '_').toLowerCase();
  return ARABIC_VALUE_LABELS[normalized] || raw.replaceAll('_', ' ').replaceAll('-', ' ');
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toPercent(value, fallback = 0) {
  const numeric = toNumber(value, fallback);
  if (numeric > 0 && numeric <= 1) {
    return numeric * 100;
  }

  return numeric;
}

function compactList(...values) {
  return values
    .flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return [value];
    })
    .map((value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }

      return (
        value.skill_id ||
        value.skill ||
        value.concept ||
        value.tag ||
        value.name ||
        value.pattern_type ||
        value.type ||
        ''
      );
    })
    .map((value) => String(value).trim())
    .filter(Boolean);
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
    return 'لا يوجد موعد مراجعة بعد';
  }

  return date.toLocaleString('ar', {
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
    return 'حان وقت المراجعة';
  }

  if (actionText.includes('prerequisite')) {
    return 'ابدأ بالمتطلب السابق';
  }

  if (actionText.includes('reteach') || actionText.includes('review')) {
    return 'مراجعة موجهة قصيرة';
  }

  if (actionText.includes('challenge') || actionText.includes('increase')) {
    return 'انتقال تدريجي لتحد أعلى';
  }

  if (actionText.includes('mixed')) {
    return 'تدريب متنوع على المهارة';
  }

  if (actionText.includes('easy') || actionText.includes('support')) {
    return 'ابدأ بسؤال داعم وسهل';
  }

  if (weaknessScore >= 60) {
    return 'قو المهارة التي تحتاج تدريبا أولا';
  }

  return 'استمر بخطوة تدريب مناسبة';
}

function getReviewMessage(retentionResult) {
  if (!retentionResult || Object.keys(retentionResult).length === 0) {
    return 'لا توجد مراجعة متباعدة مقترحة بعد.';
  }

  if (retentionResult.is_due) {
    return 'حان وقت المراجعة. ابدأ بتذكير قصير قبل الدرس التالي.';
  }

  if (retentionResult.due_at) {
    return `المراجعة التالية مجدولة في ${formatDate(retentionResult.due_at)}.`;
  }

  return `أولوية المراجعة ${formatValue(retentionResult.review_priority)}.`;
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
  const reliability = primary.reliability || {};
  const evidenceQuality = primary.evidence_quality || {};
  const questionQuality = primary.question_quality || {};
  const errorPattern = primary.error_pattern || {};
  const decisionConflict = primary.decision_conflict || {};

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
  const confidenceScore = toPercent(
    recommendation.confidence ??
      mastery.decision_confidence ??
      reliability.confidence ??
      reliability.score ??
      emotional.confidence_level,
    0,
  );
  const reliabilityScore = toPercent(reliability.score ?? reliability.reliability ?? mastery.reliability, 0);
  const consistencyScore = toPercent(performance.consistency ?? mastery.consistency_score, 0);
  const retentionScore = toPercent(retention.retention ?? mastery.retention_score, 0);

  const mainWeaknesses = Array.isArray(weakness.main_weaknesses)
    ? weakness.main_weaknesses
    : [];
  const strongSkills = compactList(
    state.strong_skills,
    primary.strong_skills,
    masteryNow >= 85 ? state.skill_id || recommendation.skill_id || recommendation.target_skill_id : '',
  );
  const practiceNeeds = compactList(
    mainWeaknesses,
    weakness.weaknesses,
    weakness.top_weaknesses,
    weakness.primary_weakness,
    primary.prerequisite_gaps?.gaps,
    primary.prerequisite_gaps?.missing_prerequisites,
  );
  const errorPatterns = compactList(
    errorPattern.pattern_type,
    errorPattern.dominant_error_tag,
    errorPattern.error_patterns,
    errorPattern.patterns,
    weakness.error_tags,
  );
  const currentDifficulty =
    difficulty.current_difficulty ??
    difficulty.difficulty ??
    state.current_difficulty ??
    state.difficulty ??
    difficulty.target_difficulty;

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
    reliability,
    evidenceQuality,
    questionQuality,
    errorPattern,
    decisionConflict,
    masteryNow,
    masteryBefore,
    masteryDelta,
    weaknessScore,
    frustrationScore,
    accuracy,
    confidenceScore,
    reliabilityScore,
    consistencyScore,
    retentionScore,
    mainWeaknesses,
    strongSkills,
    practiceNeeds,
    errorPatterns,
    currentDifficulty,
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
      <h2>لا توجد نتيجة معروضة حاليا</h2>
      <p>
        أدخل رقم الطالب ورقم الجلسة لجلب نتيجة AIM، أو اعرض آخر نتيجة محفوظة من صفحة اختبار الجلسة.
      </p>
      <button type="button" onClick={onLoadSaved}>
        عرض آخر نتيجة محفوظة
      </button>
    </section>
  );
}

function InfoList({ items, emptyText }) {
  const safeItems = compactList(items);

  return (
    <div className="adaptive-result-mini-list">
      {safeItems.length > 0 ? (
        safeItems.map((item) => (
          <span key={item}>{formatLabel(item)}</span>
        ))
      ) : (
        <span>{emptyText}</span>
      )}
    </div>
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
    confidenceScore,
    reliabilityScore,
    consistencyScore,
    retentionScore,
    strongSkills,
    practiceNeeds,
    errorPatterns,
    currentDifficulty,
    nextActionTitle,
    reviewMessage,
    recommendation,
    retention,
    difficulty,
    prompt,
    emotional,
    evidenceQuality,
    questionQuality,
    decisionConflict,
    primary,
  } = summary;

  const progressTone = masteryDelta >= 0 ? 'green' : 'amber';
  const weaknessTone = weaknessScore >= 65 ? 'red' : weaknessScore >= 35 ? 'amber' : 'green';
  const frustrationTone = frustrationScore >= 70 ? 'red' : frustrationScore >= 40 ? 'amber' : 'green';
  const attemptsSaved = primary.attempts_saved ?? primary.session_attempt_count ?? primary.valid_attempt_count;
  const recommendationText =
    recommendation.reason ||
    difficulty.reason ||
    decisionConflict.reason ||
    'تم تجهيز خطوة تعلم مناسبة بناء على بيانات الجلسة الأخيرة.';

  return (
    <>
      <section className="adaptive-result-hero">
        <div>
          <p>التوصية التالية</p>
          <h2>{nextActionTitle}</h2>
          <span>{recommendationText}</span>
        </div>
        <Badge tone="purple">
          {formatLabel(recommendation.action || recommendation.action_type || difficulty.action || 'continue_current_skill')}
        </Badge>
      </section>

      <section className="adaptive-result-grid">
        <MetricCard
          label="نسبة الإتقان"
          value={`${formatValue(masteryNow)}%`}
          helper={`قبل هذه الجلسة: ${formatValue(masteryBefore)}%`}
          tone={progressTone}
        />
        <MetricCard
          label="مستوى الثقة"
          value={`${formatValue(confidenceScore)}%`}
          helper={`موثوقية القرار: ${formatValue(reliabilityScore)}%`}
          tone={confidenceScore >= 70 ? 'green' : confidenceScore >= 40 ? 'amber' : 'blue'}
        />
        <MetricCard
          label="تغير الإتقان"
          value={`${masteryDelta >= 0 ? '+' : ''}${formatValue(masteryDelta)}%`}
          helper={masteryDelta >= 0 ? 'الإتقان تحسن أو بقي مستقرا.' : 'AIM سيبطئ الوتيرة ويدعم المراجعة.'}
          tone={progressTone}
        />
      </section>

      <section className="adaptive-result-grid">
        <MetricCard
          label="دقة الإجابات"
          value={`${formatValue(accuracy)}%`}
          helper="محسوبة من محاولات هذه المهارة."
          tone={accuracy >= 75 ? 'green' : accuracy >= 45 ? 'amber' : 'red'}
        />
        <MetricCard
          label="الاتساق"
          value={`${formatValue(consistencyScore)}%`}
          helper="يقيس ثبات الأداء عبر المحاولات."
          tone={consistencyScore >= 75 ? 'green' : consistencyScore >= 45 ? 'amber' : 'blue'}
        />
        <MetricCard
          label="الاحتفاظ"
          value={`${formatValue(retentionScore)}%`}
          helper={retention.is_due ? 'حان وقت المراجعة.' : 'تتم متابعة جدول المراجعة.'}
          tone={retention.is_due ? 'amber' : 'green'}
        />
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>نظرة عامة على الطالب</p>
            <h2>ملخص تعليمي سريع</h2>
          </div>
          <Badge tone="blue">جلسة AIM</Badge>
        </div>

        <div className="adaptive-result-action-grid">
          <div>
            <span>الطالب</span>
            <strong>{formatValue(primary.student_id || primary.updated_skill_state?.student_id)}</strong>
          </div>
          <div>
            <span>المهارة الحالية</span>
            <strong>{formatLabel(primary.updated_skill_state?.skill_id || recommendation.skill_id || recommendation.target_skill_id)}</strong>
          </div>
          <div>
            <span>المحاولات المحفوظة</span>
            <strong>{formatValue(attemptsSaved)}</strong>
          </div>
          <div>
            <span>جودة الدليل</span>
            <strong>{formatValue(evidenceQuality.score ?? evidenceQuality.evidence_quality_score)}%</strong>
          </div>
        </div>
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>المهارات القوية</p>
            <h2>نقاط يمكن البناء عليها</h2>
          </div>
          <Badge tone="green">{strongSkills.length || 0}</Badge>
        </div>
        <InfoList items={strongSkills} emptyText="لا توجد مهارة قوية مؤكدة بعد، ونحتاج إلى محاولات أكثر." />
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>مهارات تحتاج إلى تدريب</p>
            <h2>نقاط تدريب داعمة</h2>
          </div>
          <Badge tone={weaknessTone}>مهارة تحتاج تدريب {formatValue(weaknessScore)}%</Badge>
        </div>

        <div className="adaptive-result-focus">
          <Meter
            label="مؤشر الحاجة إلى التدريب"
            value={weaknessScore}
            helper={
              weaknessScore >= 65
                ? 'هذه المهارة تحتاج إلى تدريب موجه خطوة بخطوة.'
                : weaknessScore >= 35
                  ? 'توجد نقاط يمكن تقويتها بتدريب قصير.'
                  : 'لا توجد حاجة تدريب كبيرة ظاهرة حاليا.'
            }
          />
          <InfoList items={practiceNeeds} emptyText="لا توجد مهارة محددة تحتاج تدريبا إضافيا حاليا." />
        </div>
      </section>

      <section className="adaptive-result-grid adaptive-result-grid--two">
        <section className="adaptive-result-panel adaptive-result-panel--nested">
          <div className="adaptive-result-panel__header">
            <div>
              <p>أنماط الأخطاء المتكررة</p>
              <h2>ماذا نلاحظ؟</h2>
            </div>
            <Badge tone="amber">{errorPatterns.length || '0'}</Badge>
          </div>
          <InfoList items={errorPatterns} emptyText="لا يوجد نمط خطأ متكرر واضح بعد." />
        </section>

        <section className="adaptive-result-panel adaptive-result-panel--nested">
          <div className="adaptive-result-panel__header">
            <div>
              <p>مستوى الصعوبة</p>
              <h2>الصعوبة الحالية والمقترحة</h2>
            </div>
            <Badge tone="blue">{formatLabel(difficulty.action || 'maintain')}</Badge>
          </div>
          <div className="adaptive-result-action-grid adaptive-result-action-grid--compact">
            <div>
              <span>مستوى الصعوبة الحالي</span>
              <strong>{formatValue(currentDifficulty)}</strong>
            </div>
            <div>
              <span>المستوى المقترح</span>
              <strong>{formatValue(difficulty.target_difficulty || recommendation.difficulty)}</strong>
            </div>
          </div>
        </section>
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>التوصية التالية</p>
            <h2>{formatLabel(recommendation.action_type || recommendation.action || difficulty.action || 'continue_current_skill')}</h2>
          </div>
          <Badge tone="purple">
            {formatLabel(recommendation.decision_priority || decisionConflict.selected_action || 'normal')}
          </Badge>
        </div>

        <div className="adaptive-result-teacher-note">
          <strong>الدرس المقترح التالي</strong>
          <p>{recommendationText}</p>
        </div>

        {prompt.instruction_text && (
          <div className="adaptive-result-teacher-note">
            <strong>إرشاد للمعلم</strong>
            <p>{prompt.instruction_text}</p>
          </div>
        )}
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>ملخص الجلسة</p>
            <h2>مؤشرات الأداء</h2>
          </div>
          <Badge tone={frustrationTone}>يحتاج إلى تبسيط أو إبطاء {formatValue(frustrationScore)}%</Badge>
        </div>

        <div className="adaptive-result-focus">
          <Meter
            label="مؤشر الحاجة إلى تبسيط أو إبطاء"
            value={frustrationScore}
            helper={
              frustrationScore >= 70
                ? 'استخدم خطوات أبسط وتشجيعا واضحا.'
                : frustrationScore >= 40
                  ? 'استخدم إرشادا هادئا وتدريبا قصيرا.'
                  : 'يمكن للطالب المتابعة بوتيرة طبيعية.'
            }
          />

          <div className="adaptive-result-action-grid adaptive-result-action-grid--compact">
            <div>
              <span>جودة السؤال</span>
              <strong>{formatValue(questionQuality.score ?? questionQuality.quality_score)}%</strong>
            </div>
            <div>
              <span>إشارة التعلم</span>
              <strong>{formatLabel(emotional.emotional_signal || 'stable')}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="adaptive-result-panel">
        <div className="adaptive-result-panel__header">
          <div>
            <p>جدول المراجعة</p>
            <h2>{retention.is_due ? 'حان وقت المراجعة' : 'المراجعة القادمة'}</h2>
          </div>
          <Badge tone={retention.is_due ? 'amber' : 'blue'}>
            {retention.is_due ? 'حان وقت المراجعة' : 'مجدولة'}
          </Badge>
        </div>

        <div className="adaptive-result-review">
          <p>{reviewMessage}</p>
          <div className="adaptive-result-action-grid">
            <div>
              <span>الاحتفاظ</span>
              <strong>{formatValue(retention.retention)}%</strong>
            </div>
            <div>
              <span>أولوية المراجعة</span>
              <strong>{formatValue(retention.review_priority)}</strong>
            </div>
            <div>
              <span>موعد المراجعة</span>
              <strong>{formatDate(retention.due_at)}</strong>
            </div>
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
  const [source, setSource] = useState(() => (initialStored?.result ? 'آخر نتيجة محفوظة' : 'لا توجد نتيجة'));
  const [status, setStatus] = useState(() => (initialStored?.result ? 'تم عرض النتيجة المحفوظة' : 'جاهز'));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(() => isDebugEnabled());

  const summary = useMemo(() => normalizeAdaptiveResult(result), [result]);

  async function handleFetchResult() {
    if (!studentId || !sessionId) {
      setError('رقم الطالب ورقم الجلسة مطلوبان.');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('جاري تحميل نتيجة AIM');

    try {
      const data = await getPilotAdaptiveResult(studentId, sessionId);
      setResult(data);
      setSource('نتيجة من واجهة AIM الخلفية');
      setStatus('تم تحميل النتيجة بنجاح');
    } catch (requestError) {
      setError(`تعذر تحميل نتيجة AIM: ${requestError.message}`);
      setStatus('تعذر التحميل');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoadSavedResult() {
    const stored = getLastStoredAdaptiveResult();

    if (!stored?.result) {
      setError('لا توجد نتيجة محفوظة في هذا المتصفح.');
      setStatus('لا توجد نتيجة محفوظة');
      return;
    }

    setResult(stored.result);
    setStudentId(stored.meta?.studentId || studentId);
    setSessionId(stored.meta?.sessionId || sessionId);
    setSource('آخر نتيجة محفوظة');
    setError('');
    setStatus('تم عرض النتيجة المحفوظة');
  }

  function handleClearSavedResult() {
    clearLastStoredAdaptiveResult();
    setResult(null);
    setSource('لا توجد نتيجة');
    setStatus('تم مسح النتيجة المحفوظة');
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
          <p>لوحة AIM التعليمية</p>
          <h1>نتيجة التكيف الذكي</h1>
          <span>عرض عربي مبسط لنسبة الإتقان، مستوى الثقة، المهارات، التوصية، وجدول المراجعة.</span>
        </div>
        <div className="adaptive-result-header__badges">
          <Badge tone="blue">{API_BASE_URL}</Badge>
          <Badge tone={error ? 'red' : result ? 'green' : 'amber'}>{status}</Badge>
        </div>
      </header>

      <section className="adaptive-result-toolbar">
        <label>
          <span>رقم الطالب</span>
          <input
            type="number"
            min="1"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
        </label>

        <label>
          <span>رقم الجلسة</span>
          <input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            placeholder="مثال: lesson-id:session-token"
          />
        </label>

        <button type="button" onClick={handleFetchResult} disabled={isLoading}>
          {isLoading ? 'جاري التحميل...' : 'جلب النتيجة'}
        </button>

        <button type="button" onClick={handleLoadSavedResult}>
          عرض المحفوظ
        </button>

        <button type="button" onClick={handleClearSavedResult}>
          مسح المحفوظ
        </button>
      </section>

      {error && (
        <section className="adaptive-result-error" role="alert">
          {error}
        </section>
      )}

      <section className="adaptive-result-source">
        <div>
          <span>المصدر</span>
          <strong>{source}</strong>
        </div>
        <div>
          <span>الطالب</span>
          <strong>{studentId || 'غير محدد'}</strong>
        </div>
        <div>
          <span>الجلسة</span>
          <strong>{sessionId || result?.session_id || 'غير محددة'}</strong>
        </div>
        <div>
          <span>المحاولات المحفوظة</span>
          <strong>{formatValue(result?.attempts_saved)}</strong>
        </div>
      </section>

      {!result ? (
        <EmptyState onLoadSaved={handleLoadSavedResult} />
      ) : (
        <StudentResultView summary={summary} />
      )}

      {result && (
        <details className="adaptive-result-panel adaptive-result-debug" open={debugEnabled}>
          <summary onClick={handleDebugToggle}>عرض البيانات الخام للمطور</summary>
          <pre dir="ltr">{JSON.stringify(result, null, 2)}</pre>
        </details>
      )}
    </main>
  );
}

const styles = `
.adaptive-result {
  background: #eef3f7;
  color: #172328;
  direction: rtl;
  min-height: 100vh;
  padding: 28px;
  text-align: right;
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
  color: #116a63;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0;
  margin: 0 0 8px;
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
  background: #e8f3f1;
  border: 0;
  border-radius: 10px;
  color: #116a63;
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

.adaptive-result-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.adaptive-result-panel--nested {
  margin-bottom: 0;
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

.adaptive-result-mini-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.adaptive-result-mini-list span {
  background: #f8fafc;
  border: 1px solid #dbe4ef;
  border-radius: 999px;
  color: #172328;
  font-weight: 900;
  line-height: 1.4;
  padding: 10px 12px;
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

.adaptive-result-action-grid--compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  direction: ltr;
  font-size: 0.78rem;
  line-height: 1.45;
  max-height: 560px;
  overflow: auto;
  padding: 16px;
  text-align: left;
}

.adaptive-result-debug summary {
  cursor: pointer;
  font-weight: 900;
  list-style-position: inside;
}

@media (max-width: 1080px) {
  .adaptive-result-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .adaptive-result-grid,
  .adaptive-result-grid--two,
  .adaptive-result-source,
  .adaptive-result-focus,
  .adaptive-result-action-grid,
  .adaptive-result-action-grid--compact {
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
