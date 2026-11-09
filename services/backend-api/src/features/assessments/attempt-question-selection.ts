// Per-attempt random question selection for quizzes and exams.
//
// An assessment owns a POOL of questions (assessment_questions). Each attempt draws its own set from that
// pool when it starts and stores it in assessment_attempt_questions, so:
//   - every new attempt gets a different random set (preferring questions this student has not seen in an
//     earlier attempt of the same assessment) in a random order,
//   - resuming / reloading an attempt shows exactly the same questions,
//   - grading, review and answer submission are scoped to the questions the attempt actually received.
//
// assessment_settings controls it: questions_per_attempt (NULL = the whole pool), randomize_questions
// (shuffle the order), randomize_options (shuffle the answer order, seeded per attempt + question).

import { DatabaseService } from '../../database/database.service';
import { resolveQuestionsPerAttempt, resolveRandomization } from './assessment-policy';
import { pickPreferringUnseen, seededRandom, shuffled } from '../../common/random/random-selection';

interface PoolRow {
  id: string; // assessment_questions.id (the "link" id)
  order: number;
}

/** Draw and persist the question set of a freshly created attempt. Idempotent per attempt. */
export async function drawAttemptQuestions(
  db: DatabaseService,
  attemptId: string,
  assessmentId: string,
  studentId: string,
): Promise<void> {
  const [poolRes, settingsRes, seenRes] = await Promise.all([
    db.query<PoolRow>(
      `SELECT id, "order" FROM assessment_questions WHERE assessment_id = $1 ORDER BY "order" ASC`,
      [assessmentId],
    ),
    db.query<{ type: string; questions_per_attempt: number | null; randomize_questions: boolean | null }>(
      `SELECT a.type, st.questions_per_attempt, st.randomize_questions
         FROM assessments a
         LEFT JOIN assessment_settings st ON st.assessment_id = a.id
        WHERE a.id = $1`,
      [assessmentId],
    ),
    db.query<{ link_id: string; last_seen: string | Date }>(
      `SELECT aaq.assessment_question_link_id AS link_id, MAX(att.started_at) AS last_seen
         FROM assessment_attempt_questions aaq
         JOIN assessment_attempts att ON att.id = aaq.attempt_id
        WHERE att.assessment_id = $1 AND att.student_id = $2 AND att.id <> $3
        GROUP BY aaq.assessment_question_link_id`,
      [assessmentId, studentId, attemptId],
    ),
  ]);

  const pool = poolRes.rows;
  if (pool.length === 0) return;

  const settings = settingsRes.rows[0];
  const perAttempt = resolveQuestionsPerAttempt(settings?.type ?? 'quiz', settings?.questions_per_attempt);
  const randomOrder = resolveRandomization(settings).questions;

  const seenAt = new Map<string, number>();
  for (const r of seenRes.rows) seenAt.set(r.link_id, new Date(r.last_seen).getTime());

  let chosen = pickPreferringUnseen(pool, Math.min(perAttempt, pool.length), seenAt);
  if (!randomOrder) chosen = chosen.slice().sort((a, b) => a.order - b.order);

  await db.query(
    `INSERT INTO assessment_attempt_questions (attempt_id, assessment_question_link_id, position)
     SELECT $1, x.link_id, x.position
       FROM unnest($2::uuid[], $3::int[]) AS x(link_id, position)
     ON CONFLICT DO NOTHING`,
    [attemptId, chosen.map((c) => c.id), chosen.map((_, i) => i + 1)],
  );
}

/** Answer-option order for one question inside one attempt (stable across reloads). */
export function orderOptionsForAttempt<T>(
  attemptId: string,
  questionId: string,
  options: readonly T[],
  randomize: boolean,
  keepOrder = false,
): T[] {
  if (!randomize || keepOrder) return options.slice();
  return shuffled(options, seededRandom(`${attemptId}:${questionId}`));
}
