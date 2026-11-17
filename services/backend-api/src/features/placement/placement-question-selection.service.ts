// PlacementQuestionSelectionService.
//
// Scope: random, level-balanced question draw for a placement attempt.
//
// Every student gets a different random set from the question bank, so the test
// is fair and cannot be shared question-for-question. Each section has a
// `draw_count` (how many questions to deliver). Within a section the draw is
// spread over the four difficulty bands (1 = Starter/A1.1 .. 4 = A2.2+) so every
// student sees easy-to-hard coverage, and questions are served easiest first.
//
// The drawn set is stored in placement_attempt_questions, so resuming an attempt
// (or reloading the page) always returns the same questions.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface BankQuestion {
  readonly id: string;
  readonly difficulty: number;
}

/** Share of each section's draw taken from difficulty bands 1..4. */
const BAND_WEIGHTS = [2, 3, 2, 2];

/** Split [count] across the bands that actually have questions (largest remainder). */
export function bandQuotas(count: number, available: readonly number[]): number[] {
  const weights = BAND_WEIGHTS.map((w, i) => (available[i] > 0 ? w : 0));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return [0, 0, 0, 0];
  const raw = weights.map((w) => (count * w) / totalWeight);
  const quotas = raw.map((r, i) => Math.min(Math.floor(r), available[i]));
  let left = count - quotas.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
    .map((x) => x.i);
  while (left > 0) {
    let progressed = false;
    for (const i of order) {
      if (left > 0 && quotas[i] < available[i]) {
        quotas[i] += 1;
        left -= 1;
        progressed = true;
      }
    }
    if (!progressed) break;
  }
  return quotas;
}

/** Fisher–Yates with an injectable RNG (tests pass a seeded one). */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick [count] questions balanced over difficulty bands; returned easiest first. */
export function pickBalanced(
  bank: readonly BankQuestion[],
  count: number | null,
  rng: () => number = Math.random,
): BankQuestion[] {
  if (count === null || count >= bank.length) {
    return shuffle(bank, rng).sort((a, b) => a.difficulty - b.difficulty);
  }
  const bands: BankQuestion[][] = [[], [], [], []];
  for (const q of bank) bands[Math.min(4, Math.max(1, q.difficulty)) - 1].push(q);
  const quotas = bandQuotas(count, bands.map((b) => b.length));
  const picked: BankQuestion[] = [];
  bands.forEach((band, i) => picked.push(...shuffle(band, rng).slice(0, quotas[i])));
  return picked.sort((a, b) => a.difficulty - b.difficulty);
}

@Injectable()
export class PlacementQuestionSelectionService {
  constructor(private readonly db: DatabaseService) {}

  /** Draw and store the question set for a new attempt. Safe to call twice (no-op the second time). */
  async drawForAttempt(attemptId: string, testId: string, rng: () => number = Math.random): Promise<void> {
    const existing = await this.db.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM placement_attempt_questions WHERE placement_attempt_id = $1`,
      [attemptId],
    );
    if (parseInt(existing.rows[0]?.n ?? '0', 10) > 0) return;

    const sections = await this.db.query<{ id: string; draw_count: number | null }>(
      `SELECT id, draw_count FROM placement_sections WHERE placement_test_id = $1 ORDER BY order_index`,
      [testId],
    );
    let position = 0;
    for (const section of sections.rows) {
      const bank = await this.db.query<{ id: string; difficulty: number }>(
        `SELECT id, difficulty FROM placement_questions
          WHERE placement_section_id = $1 AND is_active = true`,
        [section.id],
      );
      const picked = pickBalanced(
        bank.rows.map((r) => ({ id: r.id, difficulty: Number(r.difficulty) })),
        section.draw_count,
        rng,
      );
      for (const q of picked) {
        position += 1;
        await this.db.query(
          `INSERT INTO placement_attempt_questions
             (placement_attempt_id, placement_question_id, placement_section_id, position)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [attemptId, q.id, section.id, position],
        );
      }
    }
  }
}
