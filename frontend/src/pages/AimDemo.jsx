import { useMemo, useState } from 'react';
import { runAimDemoSession } from '../shared/api/client';

const scenarioOptions = [
  {
    id: 'strong_student',
    label: 'Strong student',
    description: 'High mastery, stronger difficulty, challenge recommendation.',
  },
  {
    id: 'weak_reading_student',
    label: 'Weak reading student',
    description: 'Low reading mastery with comprehension support.',
  },
  {
    id: 'rushing_student',
    label: 'Rushing student',
    description: 'Fast answers, many mistakes, reflective pacing.',
  },
  {
    id: 'frustrated_student',
    label: 'Frustrated student',
    description: 'Repeated errors, high frustration, easier encouragement.',
  },
];

const staticDemoResult = {
  student_profile: {
    student_id: 'AIM-DEMO-001',
    student_name: 'Maha Strong',
    course: 'English Foundations',
    level: 'B1',
    lesson: 'Reading Inference',
    target_skill: 'Reading Comprehension',
    previous_mastery: 82,
    previous_difficulty: 3,
    previous_retention: 86,
    previous_weakness: 'None detected',
  },
  submitted_attempts: [
    {
      question_id: 'read-inf-1',
      skill: 'Reading Comprehension',
      is_correct: true,
      response_time: 7.2,
      attempts: 1,
      difficulty: 3,
      hint_used: false,
      skipped: false,
      answer_changed: false,
    },
    {
      question_id: 'read-inf-2',
      skill: 'Reading Comprehension',
      is_correct: true,
      response_time: 8.1,
      attempts: 1,
      difficulty: 4,
      hint_used: false,
      skipped: false,
      answer_changed: false,
    },
    {
      question_id: 'read-inf-3',
      skill: 'Reading Comprehension',
      is_correct: true,
      response_time: 6.4,
      attempts: 1,
      difficulty: 4,
      hint_used: false,
      skipped: false,
      answer_changed: false,
    },
  ],
  performance_metrics: {
    accuracy: 100,
    average_response_time: 7.2,
    retry_rate: 0,
    hesitation_index: 0,
    consistency: 100,
    difficulty_performance: 100,
  },
  mastery_update: {
    mastery_before: 82,
    mastery_after: 94,
    formula_inputs: 'Accuracy 100 x 0.35 + Speed 52 x 0.15 + Consistency 100 x 0.20 + Retention 86 x 0.15 + Difficulty 100 x 0.15',
    accuracy_contribution: 35,
    speed_contribution: 7.8,
    consistency_contribution: 20,
    retention_contribution: 12.9,
    difficulty_performance_contribution: 15,
  },
  weakness_detection: {
    detected_weak_skill: 'None',
    weakness_score: 0,
    error_frequency: 0,
    repeated_mistake_count: 0,
    explanation: 'The student answered consistently at the current level.',
  },
  error_pattern: {
    pattern_type: 'unknown',
    evidence: 'No dominant error pattern was detected.',
    treatment_recommendation: 'Continue current skill practice and increase challenge.',
  },
  emotional_state: {
    frustration_score: 0,
    emotional_label: 'calm',
    reason: 'Fast, correct responses with no skipped questions.',
    suggested_tone: 'confident and motivating',
  },
  difficulty_adaptation: {
    difficulty_before: 3,
    difficulty_score: 92,
    decision: 'increase',
    difficulty_after: 4,
    explanation: 'High mastery and consistency support harder questions.',
  },
  recommendation: {
    action: 'Challenge',
    reason: 'The learner is ready for higher-difficulty practice.',
    priority: 'Medium',
    next_skill_or_lesson_suggestion: 'Inference questions with longer passages',
  },
  prompt_adaptation_instruction: {
    instruction_text:
      'In the next lesson, give this student harder reading inference exercises and ask for evidence from the passage before accepting the answer.',
  },
  before_after: {
    before: {
      mastery: 82,
      difficulty: 3,
      retention: 86,
      weakness: 'None detected',
    },
    after: {
      mastery: 94,
      difficulty: 4,
      retention: 94,
      weakness: 'None detected',
      recommendation: 'Challenge',
      next_prompt_instruction:
        'Give harder reading inference exercises and ask for evidence from the passage.',
    },
  },
};

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  return value || 'None';
}

function normalizeAction(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase();
}

function getTone(value, type = 'default') {
  const normalized = normalizeAction(value);

  if (type === 'score') {
    const score = Number(value);
    if (score >= 75) return 'green';
    if (score >= 45) return 'amber';
    return 'red';
  }

  if (normalized.includes('frustrated') || normalized.includes('reduce') || normalized.includes('weak')) {
    return 'red';
  }

  if (normalized.includes('review') || normalized.includes('reteach') || normalized.includes('timed')) {
    return 'amber';
  }

  if (normalized.includes('challenge') || normalized.includes('prompt') || normalized.includes('instruction')) {
    return 'purple';
  }

  if (normalized.includes('increase') || normalized.includes('strong') || normalized.includes('calm')) {
    return 'green';
  }

  return 'blue';
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`aim-demo-badge aim-demo-badge--${tone}`}>{children}</span>;
}

function FieldList({ fields }) {
  return (
    <dl className="aim-demo-fields">
      {fields.map((field) => (
        <div key={field.label}>
          <dt>{field.label}</dt>
          <dd>{formatValue(field.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function StepCard({ number, title, tone = 'blue', children }) {
  return (
    <section className={`aim-demo-card aim-demo-card--${tone}`}>
      <div className="aim-demo-card__title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Meter({ label, value, tone }) {
  const numeric = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="aim-demo-meter">
      <div>
        <span>{label}</span>
        <strong>{formatValue(numeric)}%</strong>
      </div>
      <div className="aim-demo-meter__track">
        <span className={`aim-demo-meter__bar aim-demo-meter__bar--${tone}`} style={{ width: `${numeric}%` }} />
      </div>
    </div>
  );
}

function AttemptsTable({ attempts }) {
  return (
    <div className="aim-demo-table-wrap">
      <table className="aim-demo-table">
        <thead>
          <tr>
            <th>question id</th>
            <th>skill</th>
            <th>correct/wrong</th>
            <th>response time</th>
            <th>attempts/retries</th>
            <th>difficulty</th>
            <th>hint used</th>
            <th>skipped</th>
            <th>answer changed</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => (
            <tr key={attempt.question_id}>
              <td>{attempt.question_id}</td>
              <td>{attempt.skill}</td>
              <td>
                <Badge tone={attempt.is_correct ? 'green' : 'red'}>
                  {attempt.is_correct ? 'Correct' : 'Wrong'}
                </Badge>
              </td>
              <td>{formatValue(attempt.response_time)}s</td>
              <td>
                {attempt.attempts} / {Math.max(0, attempt.attempts - 1)}
              </td>
              <td>{attempt.difficulty}</td>
              <td>{formatValue(attempt.hint_used)}</td>
              <td>{formatValue(attempt.skipped)}</td>
              <td>{formatValue(attempt.answer_changed)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AimDemo() {
  const [selectedScenario, setSelectedScenario] = useState('strong_student');
  const [result, setResult] = useState(staticDemoResult);
  const [status, setStatus] = useState('Static preview loaded');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedScenarioLabel = useMemo(
    () => scenarioOptions.find((scenario) => scenario.id === selectedScenario)?.label || 'AIM scenario',
    [selectedScenario],
  );

  async function runDemo() {
    setIsLoading(true);
    setError('');
    setStatus(`Running ${selectedScenarioLabel}`);

    try {
      const data = await runAimDemoSession(selectedScenario);
      setResult(data);
      setStatus(`Rendered ${selectedScenarioLabel}`);
    } catch (requestError) {
      setError(requestError.message);
      setStatus('Backend demo endpoint unavailable');
    } finally {
      setIsLoading(false);
    }
  }

  const profile = result.student_profile;
  const metrics = result.performance_metrics;
  const mastery = result.mastery_update;
  const weakness = result.weakness_detection;
  const errorPattern = result.error_pattern;
  const emotional = result.emotional_state;
  const difficulty = result.difficulty_adaptation;
  const recommendation = result.recommendation;
  const promptInstruction = result.prompt_adaptation_instruction;
  const beforeAfter = result.before_after || {
    before: {
      mastery: profile.previous_mastery,
      difficulty: profile.previous_difficulty,
      retention: profile.previous_retention,
      weakness: profile.previous_weakness,
    },
    after: {
      mastery: mastery.mastery_after,
      difficulty: difficulty.difficulty_after,
      retention: mastery.mastery_after,
      weakness: weakness.detected_weak_skill,
      recommendation: recommendation.action,
      next_prompt_instruction: promptInstruction.instruction_text,
    },
  };

  return (
    <main className="aim-demo">
      <style>{styles}</style>

      <header className="aim-demo-header">
        <div>
          <p>AIM Visual Test</p>
          <h1>AIM adaptive pipeline dashboard</h1>
        </div>
        <Badge tone={error ? 'red' : 'blue'}>{status}</Badge>
      </header>

      <section className="aim-demo-runner" aria-label="Scenario selector">
        <div>
          <label htmlFor="aim-demo-scenario">Scenario</label>
          <select
            id="aim-demo-scenario"
            value={selectedScenario}
            onChange={(event) => setSelectedScenario(event.target.value)}
          >
            {scenarioOptions.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </div>

        <div className="aim-demo-scenarios">
          {scenarioOptions.map((scenario) => (
            <button
              className={selectedScenario === scenario.id ? 'is-selected' : ''}
              key={scenario.id}
              type="button"
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <strong>{scenario.label}</strong>
              <span>{scenario.description}</span>
            </button>
          ))}
        </div>

        <button className="aim-demo-run-button" type="button" onClick={runDemo} disabled={isLoading}>
          {isLoading ? 'Running...' : 'Run AIM Demo'}
        </button>
        {error && <p className="aim-demo-error">{error}</p>}
      </section>

      <section className="aim-demo-compare" aria-label="Before and after AIM">
        <div>
          <h2>Before AIM</h2>
          <FieldList
            fields={[
              { label: 'mastery before', value: beforeAfter.before.mastery },
              { label: 'difficulty before', value: beforeAfter.before.difficulty },
              { label: 'retention before', value: beforeAfter.before.retention },
              { label: 'weakness before', value: beforeAfter.before.weakness },
            ]}
          />
        </div>
        <div>
          <h2>After AIM</h2>
          <FieldList
            fields={[
              { label: 'mastery after', value: beforeAfter.after.mastery },
              { label: 'difficulty after', value: beforeAfter.after.difficulty },
              { label: 'retention after', value: beforeAfter.after.retention },
              { label: 'weakness after', value: beforeAfter.after.weakness },
              { label: 'recommendation', value: beforeAfter.after.recommendation },
              { label: 'next prompt instruction', value: beforeAfter.after.next_prompt_instruction },
            ]}
          />
        </div>
      </section>

      <div className="aim-demo-pipeline">
        <StepCard number="1" title="Student Profile" tone="blue">
          <FieldList
            fields={[
              { label: 'student name/id', value: `${profile.student_name} / ${profile.student_id}` },
              { label: 'course', value: profile.course },
              { label: 'level', value: profile.level },
              { label: 'lesson', value: profile.lesson },
              { label: 'target skill', value: profile.target_skill },
              { label: 'previous mastery', value: profile.previous_mastery },
              { label: 'previous difficulty', value: profile.previous_difficulty },
            ]}
          />
        </StepCard>

        <StepCard number="2" title="Submitted Attempts" tone="blue">
          <AttemptsTable attempts={result.submitted_attempts} />
        </StepCard>

        <StepCard number="3" title="Performance Metrics" tone={getTone(metrics.accuracy, 'score')}>
          <div className="aim-demo-meters">
            <Meter label="accuracy" value={metrics.accuracy} tone={getTone(metrics.accuracy, 'score')} />
            <Meter label="consistency" value={metrics.consistency} tone={getTone(metrics.consistency, 'score')} />
            <Meter
              label="difficulty performance"
              value={metrics.difficulty_performance}
              tone={getTone(metrics.difficulty_performance, 'score')}
            />
          </div>
          <FieldList
            fields={[
              { label: 'average response time', value: `${formatValue(metrics.average_response_time)}s` },
              { label: 'retry rate', value: metrics.retry_rate },
              { label: 'hesitation index', value: metrics.hesitation_index },
            ]}
          />
        </StepCard>

        <StepCard number="4" title="Mastery Update" tone={getTone(mastery.mastery_after, 'score')}>
          <div className="aim-demo-before-after-line">
            <Badge tone="blue">Before {mastery.mastery_before}%</Badge>
            <Badge tone={getTone(mastery.mastery_after, 'score')}>After {mastery.mastery_after}%</Badge>
          </div>
          <FieldList
            fields={[
              { label: 'formula inputs', value: mastery.formula_inputs },
              { label: 'accuracy contribution', value: mastery.accuracy_contribution },
              { label: 'speed contribution', value: mastery.speed_contribution },
              { label: 'consistency contribution', value: mastery.consistency_contribution },
              { label: 'retention contribution', value: mastery.retention_contribution },
              {
                label: 'difficulty performance contribution',
                value: mastery.difficulty_performance_contribution,
              },
            ]}
          />
        </StepCard>

        <StepCard number="5" title="Weakness Detection" tone={weakness.weakness_score > 45 ? 'red' : 'green'}>
          <FieldList
            fields={[
              { label: 'detected weak skill', value: weakness.detected_weak_skill },
              { label: 'weakness score', value: weakness.weakness_score },
              { label: 'error frequency', value: weakness.error_frequency },
              { label: 'repeated mistake count', value: weakness.repeated_mistake_count },
              { label: 'explanation', value: weakness.explanation },
            ]}
          />
        </StepCard>

        <StepCard number="6" title="Error Pattern" tone={getTone(errorPattern.pattern_type)}>
          <div className="aim-demo-before-after-line">
            <Badge tone={getTone(errorPattern.pattern_type)}>{errorPattern.pattern_type}</Badge>
          </div>
          <FieldList
            fields={[
              { label: 'evidence', value: errorPattern.evidence },
              { label: 'treatment recommendation', value: errorPattern.treatment_recommendation },
            ]}
          />
        </StepCard>

        <StepCard
          number="7"
          title="Emotional / Frustration State"
          tone={emotional.frustration_score >= 70 ? 'red' : 'green'}
        >
          <Meter
            label="frustration score from 0 to 100"
            value={emotional.frustration_score}
            tone={emotional.frustration_score >= 70 ? 'red' : 'green'}
          />
          <FieldList
            fields={[
              { label: 'emotional label', value: emotional.emotional_label },
              { label: 'reason/evidence', value: emotional.reason },
              { label: 'suggested tone for next lesson', value: emotional.suggested_tone },
            ]}
          />
        </StepCard>

        <StepCard number="8" title="Difficulty Adaptation" tone={getTone(difficulty.decision)}>
          <FieldList
            fields={[
              { label: 'difficulty before', value: difficulty.difficulty_before },
              { label: 'difficulty score', value: difficulty.difficulty_score },
              { label: 'decision', value: difficulty.decision },
              { label: 'difficulty after', value: difficulty.difficulty_after },
              { label: 'explanation', value: difficulty.explanation },
            ]}
          />
        </StepCard>

        <StepCard number="9" title="Recommendation" tone="purple">
          <div className="aim-demo-recommendation">
            <Badge tone="purple">{recommendation.action}</Badge>
          </div>
          <FieldList
            fields={[
              { label: 'reason', value: recommendation.reason },
              { label: 'priority', value: recommendation.priority },
              {
                label: 'next skill or lesson suggestion',
                value: recommendation.next_skill_or_lesson_suggestion,
              },
            ]}
          />
        </StepCard>

        <StepCard number="10" title="Prompt Adaptation Instruction" tone="purple">
          <p className="aim-demo-prompt">{promptInstruction.instruction_text}</p>
        </StepCard>
      </div>
    </main>
  );
}

const styles = `
.aim-demo {
  background: #f6f8fb;
  color: #172328;
  min-height: 100vh;
  padding: 28px;
}

.aim-demo-header,
.aim-demo-runner,
.aim-demo-compare,
.aim-demo-pipeline {
  margin: 0 auto;
  max-width: 1240px;
}

.aim-demo-header {
  align-items: center;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.aim-demo-header p {
  color: #3f6f78;
  font-size: 0.78rem;
  font-weight: 900;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.aim-demo-header h1 {
  font-size: clamp(2rem, 4vw, 3.8rem);
  letter-spacing: 0;
  line-height: 1;
  margin: 0;
}

.aim-demo-runner {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  display: grid;
  gap: 16px;
  grid-template-columns: 240px minmax(0, 1fr) 180px;
  margin-bottom: 18px;
  padding: 18px;
}

.aim-demo-runner label {
  color: #65758b;
  display: block;
  font-size: 0.78rem;
  font-weight: 900;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.aim-demo-runner select {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #172328;
  min-height: 44px;
  padding: 0 12px;
  width: 100%;
}

.aim-demo-scenarios {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.aim-demo-scenarios button,
.aim-demo-run-button {
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
}

.aim-demo-scenarios button {
  background: #f8fafc;
  border: 1px solid #dbe4ef;
  color: #172328;
  display: grid;
  gap: 6px;
  min-height: 88px;
  padding: 12px;
  text-align: left;
}

.aim-demo-scenarios button span {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.aim-demo-scenarios button.is-selected {
  background: #eaf2ff;
  border-color: #2563eb;
}

.aim-demo-run-button {
  align-self: stretch;
  background: #172328;
  border: 0;
  color: #ffffff;
  min-height: 48px;
}

.aim-demo-run-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.aim-demo-error {
  color: #b91c1c;
  font-weight: 800;
  grid-column: 1 / -1;
  margin: 0;
}

.aim-demo-compare {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 18px;
}

.aim-demo-compare > div,
.aim-demo-card {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(31, 57, 87, 0.08);
  padding: 20px;
}

.aim-demo-compare h2,
.aim-demo-card h2 {
  font-size: 1.15rem;
  line-height: 1.25;
  margin: 0;
}

.aim-demo-pipeline {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.aim-demo-card {
  border-top: 6px solid #2563eb;
}

.aim-demo-card--green { border-top-color: #16a34a; }
.aim-demo-card--amber { border-top-color: #d97706; }
.aim-demo-card--red { border-top-color: #dc2626; }
.aim-demo-card--purple { border-top-color: #7c3aed; }

.aim-demo-card__title {
  align-items: center;
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.aim-demo-card__title span {
  align-items: center;
  background: #eef4ff;
  border-radius: 999px;
  color: #164da8;
  display: inline-flex;
  flex: 0 0 auto;
  font-weight: 900;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.aim-demo-fields {
  display: grid;
  gap: 10px;
  margin: 0;
}

.aim-demo-fields div {
  display: grid;
  gap: 4px;
}

.aim-demo-fields dt,
.aim-demo-meter span {
  color: #65758b;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.aim-demo-fields dd {
  color: #172328;
  font-weight: 800;
  line-height: 1.45;
  margin: 0;
  overflow-wrap: anywhere;
}

.aim-demo-table-wrap {
  overflow-x: auto;
}

.aim-demo-table {
  border-collapse: collapse;
  min-width: 920px;
  width: 100%;
}

.aim-demo-table th,
.aim-demo-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}

.aim-demo-table th {
  color: #64748b;
  font-size: 0.74rem;
  text-transform: uppercase;
}

.aim-demo-table td {
  font-weight: 700;
}

.aim-demo-badge {
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.1;
  padding: 7px 10px;
}

.aim-demo-badge--blue {
  background: #eef4ff;
  border-color: #bfdbfe;
  color: #164da8;
}

.aim-demo-badge--green {
  background: #ecfdf5;
  border-color: #86efac;
  color: #166534;
}

.aim-demo-badge--amber {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.aim-demo-badge--red {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.aim-demo-badge--purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
  color: #5b21b6;
}

.aim-demo-meters {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.aim-demo-meter {
  display: grid;
  gap: 8px;
}

.aim-demo-meter > div:first-child {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.aim-demo-meter strong {
  color: #172328;
}

.aim-demo-meter__track {
  background: #e6edf5;
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
}

.aim-demo-meter__bar {
  display: block;
  height: 100%;
}

.aim-demo-meter__bar--blue { background: #2563eb; }
.aim-demo-meter__bar--green { background: #16a34a; }
.aim-demo-meter__bar--amber { background: #d97706; }
.aim-demo-meter__bar--red { background: #dc2626; }
.aim-demo-meter__bar--purple { background: #7c3aed; }

.aim-demo-before-after-line,
.aim-demo-recommendation {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.aim-demo-prompt {
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 8px;
  color: #3b2375;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.6;
  margin: 0;
  padding: 18px;
}

@media (max-width: 1080px) {
  .aim-demo-runner {
    grid-template-columns: 1fr;
  }

  .aim-demo-scenarios {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 840px) {
  .aim-demo-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .aim-demo-compare,
  .aim-demo-pipeline {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .aim-demo {
    padding: 16px;
  }

  .aim-demo-scenarios {
    grid-template-columns: 1fr;
  }
}
`;

export default AimDemo;
