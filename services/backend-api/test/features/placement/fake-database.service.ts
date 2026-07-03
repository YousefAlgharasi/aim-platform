// P19-009
// FakeDatabaseService — in-memory stand-in for DatabaseService used only in
// the placement integration test (placement-e2e.spec.ts).
//
// This is test-only code. It does not touch any production file and is not
// imported by any production module. It implements just enough of the
// `query(text, values)` surface that the placement feature's real services
// rely on, by matching on the static SQL text each service issues (every
// query below corresponds 1:1 to a query found in src/features/placement).
//
// Rationale: there is no live Postgres instance available in CI for this
// repo's backend-api test suite (see test/setup-test-env.ts — DATABASE_URL
// is a placeholder). Routing the full HTTP -> guard -> controller -> real
// service stack through an in-memory fake keeps the integration test
// CI-safe while still exercising the actual production service/controller
// code, not mocks of it.

import { randomUUID } from 'crypto';
import { QueryResult, QueryResultRow } from 'pg';

interface PlacementTestRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  estimated_minutes: number;
  total_sections: number;
  version: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface PlacementSectionRow {
  id: string;
  placement_test_id: string;
  title: string;
  skill_code: string;
  order_index: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

interface PlacementQuestionRow {
  id: string;
  placement_section_id: string;
  question_type: string;
  prompt: string;
  media_url: string | null;
  order_index: number;
  correct_answer: string;
  created_at: string;
  updated_at: string;
}

interface PlacementAttemptRow {
  id: string;
  student_id: string;
  placement_test_id: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PlacementAnswerRow {
  id: string;
  placement_attempt_id: string;
  placement_question_id: string;
  answer_value: string;
  is_correct: boolean | null;
  skill_code: string;
  created_at: string;
}

interface PlacementResultRow {
  id: string;
  placement_attempt_id: string;
  student_id: string;
  estimated_level: string;
  skill_mastery_map: unknown;
  weakness_map: unknown;
  initial_path_id: string | null;
  created_at: string;
}

interface AuditLogRow {
  id: string;
  placement_attempt_id: string | null;
  student_id: string;
  event_type: string;
  event_data: unknown;
  created_at: string;
}

interface InitialLearningPathRow {
  id: string;
  placement_result_id: string;
  priority: number;
  entry_type: string;
  skill_code: string | null;
  skill_id: string | null;
  skill_key: string | null;
  skill_name: string;
  estimated_level: string;
  source: string;
}

function now(): string {
  return new Date().toISOString();
}

function toQueryResult<T extends QueryResultRow>(rows: T[]): QueryResult<T> {
  return {
    rows,
    rowCount: rows.length,
    command: '',
    oid: 0,
    fields: [],
  } as unknown as QueryResult<T>;
}

export class FakeDatabaseService {
  readonly tests: PlacementTestRow[] = [];
  readonly sections: PlacementSectionRow[] = [];
  readonly questions: PlacementQuestionRow[] = [];
  readonly attempts: PlacementAttemptRow[] = [];
  readonly answers: PlacementAnswerRow[] = [];
  readonly results: PlacementResultRow[] = [];
  readonly auditLog: AuditLogRow[] = [];
  readonly initialLearningPath: InitialLearningPathRow[] = [];

  /** Seed a published test with sections and questions for the happy-path flow. */
  seedPublishedTest(): { testId: string; sectionIds: string[]; questionIdsBySection: Record<string, string[]> } {
    // Only one test may be 'published' at a time in production — mirror that
    // here so each call to seedPublishedTest() in a test deterministically
    // becomes the one active test, regardless of what earlier tests seeded.
    this.tests.forEach((t) => {
      if (t.status === 'published') t.status = 'archived';
    });

    const testId = randomUUID();
    this.tests.push({
      id: testId,
      title: 'Seeded Placement Test',
      description: null,
      status: 'published',
      estimated_minutes: 20,
      total_sections: 2,
      version: 1,
      created_at: now(),
      updated_at: now(),
      published_at: now(),
    });

    const sectionIds: string[] = [];
    const questionIdsBySection: Record<string, string[]> = {};
    const skillCodes = ['grammar', 'vocabulary'];

    skillCodes.forEach((skillCode, sectionIndex) => {
      const sectionId = randomUUID();
      sectionIds.push(sectionId);
      this.sections.push({
        id: sectionId,
        placement_test_id: testId,
        title: `${skillCode} section`,
        skill_code: skillCode,
        order_index: sectionIndex,
        total_questions: 2,
        created_at: now(),
        updated_at: now(),
      });

      questionIdsBySection[sectionId] = [];
      for (let i = 0; i < 2; i++) {
        const questionId = randomUUID();
        questionIdsBySection[sectionId].push(questionId);
        this.questions.push({
          id: questionId,
          placement_section_id: sectionId,
          question_type: 'multiple_choice',
          prompt: `${skillCode} question ${i + 1}`,
          media_url: null,
          order_index: i,
          correct_answer: 'A',
          created_at: now(),
          updated_at: now(),
        });
      }
    });

    return { testId, sectionIds, questionIdsBySection };
  }

  // ---------------------------------------------------------------------
  // query() — pattern-matched against the exact SQL the placement services
  // issue. Order matters: more specific matches are checked first.
  // ---------------------------------------------------------------------

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    const sql = text.replace(/\s+/g, ' ').trim();
    const params = [...values];

    // ---- placement_tests -------------------------------------------------
    if (sql.includes('FROM placement_tests') && sql.includes("status = 'published'")) {
      const test = this.tests.find((t) => t.status === 'published');
      return toQueryResult(test ? [test as unknown as T] : []);
    }

    // ---- placement_attempts: abandon existing active/submitted ----------
    if (sql.startsWith('UPDATE placement_attempts') && sql.includes("status = 'abandoned'")) {
      const [studentId, testId] = params as [string, string];
      const abandoned = this.attempts.filter(
        (a) => a.student_id === studentId && a.placement_test_id === testId && (a.status === 'active' || a.status === 'submitted'),
      );
      abandoned.forEach((a) => {
        a.status = 'abandoned';
        a.updated_at = now();
      });
      return toQueryResult(abandoned.map((a) => ({ id: a.id })) as unknown as T[]);
    }

    // ---- placement_attempts: insert new attempt --------------------------
    if (sql.startsWith('INSERT INTO placement_attempts')) {
      const [studentId, testId] = params as [string, string];
      const attempt: PlacementAttemptRow = {
        id: randomUUID(),
        student_id: studentId,
        placement_test_id: testId,
        status: 'active',
        started_at: now(),
        submitted_at: null,
        completed_at: null,
        created_at: now(),
        updated_at: now(),
      };
      this.attempts.push(attempt);
      return toQueryResult([attempt as unknown as T]);
    }

    // ---- placement_attempts: lookup by id (+ optional student_id) --------
    if (sql.startsWith('SELECT') && sql.includes('FROM placement_attempts') && sql.includes('WHERE id = $1')) {
      if (sql.includes('AND student_id = $2')) {
        const [attemptId, studentId] = params as [string, string];
        const attempt = this.attempts.find((a) => a.id === attemptId && a.student_id === studentId);
        return toQueryResult(attempt ? [attempt as unknown as T] : []);
      }
      const [attemptId] = params as [string];
      const attempt = this.attempts.find((a) => a.id === attemptId);
      return toQueryResult(attempt ? [attempt as unknown as T] : []);
    }

    // ---- retake policy: latest non-abandoned attempt ---------------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('FROM placement_attempts') &&
      sql.includes("status != 'abandoned'")
    ) {
      const [studentId, testId] = params as [string, string];
      const candidates = this.attempts
        .filter((a) => a.student_id === studentId && a.placement_test_id === testId && a.status !== 'abandoned')
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return toQueryResult(candidates.length > 0 ? [candidates[0] as unknown as T] : []);
    }

    // ---- placement_attempts: transition submitted -> completed -----------
    if (sql.startsWith('UPDATE placement_attempts') && sql.includes("status = 'completed'")) {
      const [attemptId] = params as [string];
      const attempt = this.attempts.find((a) => a.id === attemptId);
      if (attempt) {
        attempt.status = 'completed';
        attempt.completed_at = now();
        attempt.updated_at = now();
      }
      return toQueryResult([]);
    }

    // ---- placement_attempts: transition active -> submitted --------------
    if (sql.startsWith('UPDATE placement_attempts') && sql.includes("status = 'submitted'")) {
      const [attemptId] = params as [string];
      const attempt = this.attempts.find((a) => a.id === attemptId);
      if (attempt) {
        attempt.status = 'submitted';
        attempt.submitted_at = now();
        attempt.updated_at = now();
      }
      return toQueryResult(attempt ? [attempt as unknown as T] : []);
    }

    // ---- placement_attempts: completion progress (questions vs answers) --
    if (sql.includes('total_questions') && sql.includes('total_answered')) {
      const [testId, attemptId] = params as [string, string];
      const sectionIds = this.sections.filter((s) => s.placement_test_id === testId).map((s) => s.id);
      const totalQuestions = this.questions.filter((q) => sectionIds.includes(q.placement_section_id)).length;
      const totalAnswered = this.answers.filter((a) => a.placement_attempt_id === attemptId).length;
      return toQueryResult([
        { total_questions: String(totalQuestions), total_answered: String(totalAnswered) } as unknown as T,
      ]);
    }

    // ---- placement_questions joined with placement_sections --------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('FROM placement_questions pq') &&
      sql.includes('JOIN placement_sections ps') &&
      sql.includes('ps.placement_test_id = $2')
    ) {
      const [questionId, testId] = params as [string, string];
      const question = this.questions.find((q) => q.id === questionId);
      const section = question ? this.sections.find((s) => s.id === question.placement_section_id) : undefined;
      if (!question || !section || section.placement_test_id !== testId) {
        return toQueryResult([]);
      }
      return toQueryResult([
        {
          id: question.id,
          question_type: question.question_type,
          skill_code: section.skill_code,
          placement_section_id: question.placement_section_id,
        } as unknown as T,
      ]);
    }

    // ---- placement_answers: duplicate check -------------------------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('FROM placement_answers') &&
      sql.includes('placement_attempt_id = $1') &&
      sql.includes('placement_question_id = $2') &&
      !sql.includes('JOIN')
    ) {
      const [attemptId, questionId] = params as [string, string];
      const existing = this.answers.find(
        (a) => a.placement_attempt_id === attemptId && a.placement_question_id === questionId,
      );
      return toQueryResult(existing ? [{ id: existing.id } as unknown as T] : []);
    }

    // ---- placement_answers: insert -----------------------------------------
    if (sql.startsWith('INSERT INTO placement_answers')) {
      const [attemptId, questionId, answerValue, skillCode] = params as [string, string, string, string];
      const answer: PlacementAnswerRow = {
        id: randomUUID(),
        placement_attempt_id: attemptId,
        placement_question_id: questionId,
        answer_value: answerValue,
        is_correct: null,
        skill_code: skillCode,
        created_at: now(),
      };
      this.answers.push(answer);
      return toQueryResult([answer as unknown as T]);
    }

    // ---- section completion progress (total vs answered in one section) --
    if (sql.includes('total_questions') && sql.includes('answered_questions')) {
      const [sectionId, attemptId] = params as [string, string];
      const totalQuestions = this.questions.filter((q) => q.placement_section_id === sectionId).length;
      const answeredQuestions = this.answers.filter(
        (a) =>
          a.placement_attempt_id === attemptId &&
          this.questions.find((q) => q.id === a.placement_question_id)?.placement_section_id === sectionId,
      ).length;
      return toQueryResult([
        {
          total_questions: String(totalQuestions),
          answered_questions: String(answeredQuestions),
        } as unknown as T,
      ]);
    }

    // ---- section accuracy (correct vs total in one section) --------------
    if (sql.includes('COUNT(*) FILTER') && sql.includes('placement_section_id = $1') && sql.includes('pa.placement_attempt_id = $2')) {
      const [sectionId, attemptId] = params as [string, string];
      const sectionAnswers = this.answers.filter(
        (a) =>
          a.placement_attempt_id === attemptId &&
          this.questions.find((q) => q.id === a.placement_question_id)?.placement_section_id === sectionId,
      );
      const correct = sectionAnswers.filter((a) => {
        const question = this.questions.find((q) => q.id === a.placement_question_id);
        return question && a.answer_value.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
      }).length;
      return toQueryResult([
        { correct: String(correct), total: String(sectionAnswers.length) } as unknown as T,
      ]);
    }

    // ---- answer validation: fetch all answers + correct_answer ------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('FROM placement_answers pa') &&
      sql.includes('pq.correct_answer') &&
      sql.includes('WHERE pa.placement_attempt_id = $1') &&
      !sql.includes('AVG')
    ) {
      const [attemptId] = params as [string];
      const rows = this.answers
        .filter((a) => a.placement_attempt_id === attemptId)
        .map((a) => {
          const question = this.questions.find((q) => q.id === a.placement_question_id);
          return {
            answer_id: a.id,
            answer_value: a.answer_value,
            correct_answer: question?.correct_answer ?? '',
            question_type: question?.question_type ?? '',
          };
        });
      return toQueryResult(rows as unknown as T[]);
    }

    // ---- answer validation: bulk mark correct / incorrect -----------------
    if (sql.startsWith('UPDATE placement_answers') && sql.includes('is_correct = true')) {
      const [ids] = params as [string[]];
      ids.forEach((id) => {
        const answer = this.answers.find((a) => a.id === id);
        if (answer) answer.is_correct = true;
      });
      return toQueryResult([]);
    }
    if (sql.startsWith('UPDATE placement_answers') && sql.includes('is_correct = false')) {
      const [ids] = params as [string[]];
      ids.forEach((id) => {
        const answer = this.answers.find((a) => a.id === id);
        if (answer) answer.is_correct = false;
      });
      return toQueryResult([]);
    }

    // ---- scoring: skill_code + is_correct per answer -----------------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('pa.skill_code') &&
      sql.includes('pa.is_correct') &&
      sql.includes('FROM placement_answers pa') &&
      !sql.includes('JOIN')
    ) {
      const [attemptId] = params as [string];
      const rows = this.answers
        .filter((a) => a.placement_attempt_id === attemptId)
        .map((a) => ({ skill_code: a.skill_code, is_correct: a.is_correct }));
      return toQueryResult(rows as unknown as T[]);
    }

    // ---- scoring: per-skill signal join (placement_question_skills) -------
    if (sql.includes('placement_question_skills') && sql.includes('JOIN skills')) {
      // No question_skill links are seeded in this fake — skill-level signal
      // is empty, which is a valid input to PlacementScoringService.
      return toQueryResult([]);
    }

    // ---- placement_results: idempotency / lookup by attempt ---------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('FROM placement_results') &&
      sql.includes('placement_attempt_id = $1') &&
      !sql.includes('INSERT')
    ) {
      const [attemptId] = params as [string];
      const result = this.results.find((r) => r.placement_attempt_id === attemptId);
      return toQueryResult(result ? [result as unknown as T] : []);
    }

    // ---- placement_results: lookup by id (initial learning path step) -----
    if (sql.startsWith('SELECT') && sql.includes('FROM placement_results') && sql.includes('WHERE id = $1')) {
      const [resultId] = params as [string];
      const result = this.results.find((r) => r.id === resultId);
      return toQueryResult(result ? [result as unknown as T] : []);
    }

    // ---- placement_results: insert -----------------------------------------
    if (sql.startsWith('INSERT INTO placement_results')) {
      const [attemptId, studentId, estimatedLevel, skillMasteryMap, weaknessMap] = params as [
        string,
        string,
        string,
        string,
        string,
      ];
      const result: PlacementResultRow = {
        id: randomUUID(),
        placement_attempt_id: attemptId,
        student_id: studentId,
        estimated_level: estimatedLevel,
        skill_mastery_map: JSON.parse(skillMasteryMap),
        weakness_map: JSON.parse(weaknessMap),
        initial_path_id: null,
        created_at: now(),
      };
      this.results.push(result);
      return toQueryResult([result as unknown as T]);
    }

    // ---- placement_results: set initial_path_id ----------------------------
    if (sql.startsWith('UPDATE placement_results') && sql.includes('initial_path_id = $1')) {
      const [pathId, resultId] = params as [string, string];
      const result = this.results.find((r) => r.id === resultId);
      if (result) result.initial_path_id = pathId;
      return toQueryResult([]);
    }

    // ---- initial learning path: skill_id resolution (P20-004) -------------
    // No skills are seeded by this fake, so every weakness_map/skill_mastery_map
    // code resolves to "no match" — every path entry stays section-level, which
    // matches this test's fixtures (section-level placement_answers.skill_code
    // only, no skill-tagged questions).
    if (sql.startsWith('SELECT id, key FROM skills')) {
      return toQueryResult([]);
    }

    // ---- initial_learning_path: bulk insert --------------------------------
    if (sql.startsWith('INSERT INTO initial_learning_path')) {
      const columnsPerRow = 9;
      const rows: InitialLearningPathRow[] = [];
      for (let i = 0; i < params.length; i += columnsPerRow) {
        const [resultId, priority, entryType, skillCode, skillId, skillKey, skillName, estimatedLevel, source] =
          params.slice(i, i + columnsPerRow) as [
            string,
            number,
            string,
            string | null,
            string | null,
            string | null,
            string,
            string,
            string,
          ];
        const row: InitialLearningPathRow = {
          id: randomUUID(),
          placement_result_id: resultId,
          priority,
          entry_type: entryType,
          skill_code: skillCode,
          skill_id: skillId,
          skill_key: skillKey,
          skill_name: skillName,
          estimated_level: estimatedLevel,
          source,
        };
        this.initialLearningPath.push(row);
        rows.push(row);
      }
      return toQueryResult(rows.map((r) => ({ id: r.id, priority: r.priority })) as unknown as T[]);
    }

    // ---- analytics summary: attempt counts ---------------------------------
    if (sql.startsWith('SELECT') && sql.includes('FROM placement_attempts') && sql.includes("FILTER (WHERE status = 'completed')")) {
      const total = this.attempts.length;
      const completed = this.attempts.filter((a) => a.status === 'completed').length;
      return toQueryResult([{ total: String(total), completed: String(completed) } as unknown as T]);
    }

    // ---- analytics summary: band distribution ------------------------------
    if (sql.startsWith('SELECT') && sql.includes('estimated_level, COUNT(*)') && sql.includes('FROM placement_results')) {
      const counts = new Map<string, number>();
      for (const r of this.results) {
        counts.set(r.estimated_level, (counts.get(r.estimated_level) ?? 0) + 1);
      }
      const rows = [...counts.entries()].map(([estimated_level, count]) => ({
        estimated_level,
        count: String(count),
      }));
      return toQueryResult(rows as unknown as T[]);
    }

    // ---- analytics summary: per-section accuracy ---------------------------
    if (sql.includes('AVG(') && sql.includes('GROUP BY ps.skill_code')) {
      const bySkill = new Map<string, { correct: number; total: number }>();
      for (const answer of this.answers) {
        if (answer.is_correct === null) continue;
        const stats = bySkill.get(answer.skill_code) ?? { correct: 0, total: 0 };
        stats.total += 1;
        if (answer.is_correct) stats.correct += 1;
        bySkill.set(answer.skill_code, stats);
      }
      const rows = [...bySkill.entries()].map(([skill_code, stats]) => ({
        skill_code,
        avg_accuracy: String(stats.correct / stats.total),
        sample_size: String(stats.total),
      }));
      return toQueryResult(rows as unknown as T[]);
    }

    // ---- placement_audit_log / analytics event writes ----------------------
    if (sql.startsWith('INSERT INTO placement_audit_log')) {
      const [attemptId, studentId, eventType, eventData] = params as [string, string, string, string];
      this.auditLog.push({
        id: randomUUID(),
        placement_attempt_id: attemptId,
        student_id: studentId,
        event_type: eventType,
        event_data: JSON.parse(eventData),
        created_at: now(),
      });
      return toQueryResult([]);
    }

    // ---- placement_sections: list for active test --------------------------
    if (sql.startsWith('SELECT') && sql.includes('FROM placement_sections') && sql.includes('placement_test_id = $1')) {
      const [testId] = params as [string];
      const rows = this.sections
        .filter((s) => s.placement_test_id === testId)
        .sort((a, b) => a.order_index - b.order_index);
      return toQueryResult(rows as unknown as T[]);
    }

    // ---- placement_sections: lookup by id (question delivery) -------------
    if (sql.startsWith('SELECT') && sql.includes('FROM placement_sections') && sql.includes('WHERE id = $1')) {
      const [sectionId] = params as [string];
      const section = this.sections.find((s) => s.id === sectionId);
      return toQueryResult(section ? [{ id: section.id } as unknown as T] : []);
    }

    // ---- placement_questions: deliver for section --------------------------
    if (
      sql.startsWith('SELECT') &&
      sql.includes('FROM placement_questions pq') &&
      sql.includes('pq.placement_section_id = $1') &&
      sql.includes('ORDER BY pq.order_index')
    ) {
      const [sectionId] = params as [string];
      const section = this.sections.find((s) => s.id === sectionId);
      const rows = this.questions
        .filter((q) => q.placement_section_id === sectionId)
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({ ...q, skill_code: section?.skill_code ?? '' }));
      return toQueryResult(rows as unknown as T[]);
    }

    throw new Error(`FakeDatabaseService: unrecognised query — ${sql}`);
  }

  async withClient<T>(callback: (client: unknown) => Promise<T>): Promise<T> {
    throw new Error('FakeDatabaseService.withClient is not implemented — not used by the placement student flow.');
  }
}
