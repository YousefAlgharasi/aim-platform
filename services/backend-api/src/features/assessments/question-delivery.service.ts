// P10-041: QuestionDeliveryService.
//
// Scope: Deliver assessment questions to students with all grading
//        metadata stripped. This is the ONLY path through which questions
//        reach Flutter during an active attempt.
//
// Security rules:
//   - correct_answer, is_correct, points, section weight, grading_mode,
//     and pass_threshold are NEVER included in the response.
//   - Question options are delivered without any correctness indicator.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AssessmentRepository } from './assessment.repository';
import { orderOptionsForAttempt } from './attempt-question-selection';

export interface DeliveredOption {
  readonly id: string;
  readonly label: string;
  readonly text: string;
}

export interface DeliveredQuestion {
  readonly id: string;
  readonly assessmentQuestionLinkId: string;
  readonly sectionId: string | null;
  readonly order: number;
  readonly type: string;
  readonly prompt: string;
  readonly options: DeliveredOption[];
}

interface QuestionRow {
  link_id: string;
  section_id: string | null;
  link_order: number;
  question_id: string;
  question_type: string;
  prompt: string;
  randomize_options?: boolean;
  has_draw?: boolean;
}

interface OptionRow {
  id: string;
  question_id: string;
  text: string;
  sort_order: number;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

@Injectable()
export class QuestionDeliveryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly assessmentRepository: AssessmentRepository,
  ) {}

  /**
   * The question list for the assessment behind [attemptId], ownership-
   * checked against [studentId] first — the only path through which a
   * client can reach question content, so ownership must be verified here
   * too (not just by the guard) in case this is ever called directly.
   */
  async getQuestionsForAttempt(
    attemptId: string,
    studentId: string,
  ): Promise<DeliveredQuestion[]> {
    const attempt = await this.assessmentRepository.findAttemptById(attemptId);
    if (!attempt || attempt.student_id !== studentId) {
      throw new NotFoundException(`Assessment attempt not found`);
    }
    return this.getQuestionsForAssessment(attempt.assessment_id, attemptId);
  }

  /**
   * [attemptId] given: only the questions drawn for that attempt, in the attempt's order, with the
   * answer order shuffled when the assessment's randomize_options is on. Attempts that predate random
   * selection (no stored draw) fall back to the whole assessment in its fixed order.
   */
  async getQuestionsForAssessment(
    assessmentId: string,
    attemptId?: string,
  ): Promise<DeliveredQuestion[]> {
    const qRes = await this.db.query<QuestionRow>(
      `SELECT
         aq.id        AS link_id,
         aq.section_id,
         COALESCE(aaq.position, aq."order") AS link_order,
         q.id         AS question_id,
         q.type       AS question_type,
         q.stem       AS prompt,
         COALESCE((SELECT st.randomize_options FROM assessment_settings st
                    WHERE st.assessment_id = aq.assessment_id), true) AS randomize_options,
         EXISTS (SELECT 1 FROM assessment_attempt_questions d WHERE d.attempt_id = $2::uuid) AS has_draw
       FROM assessment_questions aq
       JOIN question_bank q ON q.id = aq.question_id
       LEFT JOIN assessment_attempt_questions aaq
         ON aaq.assessment_question_link_id = aq.id AND aaq.attempt_id = $2::uuid
       WHERE aq.assessment_id = $1
         AND (
           NOT EXISTS (SELECT 1 FROM assessment_attempt_questions d WHERE d.attempt_id = $2::uuid)
           OR aaq.attempt_id IS NOT NULL
         )
       ORDER BY COALESCE(aaq.position, aq."order") ASC`,
      [assessmentId, attemptId ?? null],
    );

    if (qRes.rows.length === 0) {
      throw new NotFoundException(`No questions found for assessment ${assessmentId}`);
    }

    const questionIds = qRes.rows.map(r => r.question_id);

    const optRes = await this.db.query<OptionRow>(
      `SELECT id, question_id, text, sort_order
       FROM question_choices
       WHERE question_id = ANY($1)
       ORDER BY sort_order ASC`,
      [questionIds],
    );

    const rawByQuestion = new Map<string, OptionRow[]>();
    for (const o of optRes.rows) {
      const list = rawByQuestion.get(o.question_id) ?? [];
      list.push(o);
      rawByQuestion.set(o.question_id, list);
    }

    // Order (optionally shuffled per attempt) first, THEN label A, B, C… so labels follow what is shown.
    const optionsByQuestion = new Map<string, DeliveredOption[]>();
    const typeById = new Map(qRes.rows.map((r) => [r.question_id, r.question_type]));
    for (const [questionId, raw] of rawByQuestion) {
      const ordered = orderOptionsForAttempt(
        attemptId ?? assessmentId,
        questionId,
        raw,
        !!(qRes.rows[0]?.has_draw && qRes.rows[0]?.randomize_options),
        typeById.get(questionId) === 'true_false',
      );
      optionsByQuestion.set(
        questionId,
        ordered.map((o, i) => ({ id: o.id, label: OPTION_LABELS[i] ?? String(i + 1), text: o.text })),
      );
    }

    return qRes.rows.map(q => ({
      id: q.question_id,
      assessmentQuestionLinkId: q.link_id,
      sectionId: q.section_id,
      order: q.link_order,
      type: q.question_type,
      prompt: q.prompt,
      options: optionsByQuestion.get(q.question_id) ?? [],
    }));
  }
}
