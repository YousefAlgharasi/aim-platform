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
}

interface OptionRow {
  id: string;
  question_id: string;
  label: string;
  option_text: string;
}

@Injectable()
export class QuestionDeliveryService {
  constructor(private readonly db: DatabaseService) {}

  async getQuestionsForAssessment(assessmentId: string): Promise<DeliveredQuestion[]> {
    const qRes = await this.db.query<QuestionRow>(
      `SELECT
         aq.id        AS link_id,
         aq.section_id,
         aq.\"order\"   AS link_order,
         q.id         AS question_id,
         q.type       AS question_type,
         q.prompt
       FROM assessment_questions aq
       JOIN questions q ON q.id = aq.question_id
       WHERE aq.assessment_id = $1
       ORDER BY aq.\"order\" ASC`,
      [assessmentId],
    );

    if (qRes.rows.length === 0) {
      throw new NotFoundException(`No questions found for assessment ${assessmentId}`);
    }

    const questionIds = qRes.rows.map(r => r.question_id);

    const optRes = await this.db.query<OptionRow>(
      `SELECT id, question_id, label, option_text
       FROM question_choices
       WHERE question_id = ANY($1)
       ORDER BY label ASC`,
      [questionIds],
    );

    const optionsByQuestion = new Map<string, DeliveredOption[]>();
    for (const o of optRes.rows) {
      const list = optionsByQuestion.get(o.question_id) ?? [];
      list.push({ id: o.id, label: o.label, text: o.option_text });
      optionsByQuestion.set(o.question_id, list);
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
