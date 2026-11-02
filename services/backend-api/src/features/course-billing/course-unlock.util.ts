// Course unlock rule — one place, used by the course list, enrollment, payment
// submission and lesson access so they can never disagree.
//
// Courses in a track are ordered by cefr_rank (1 = first). A student's
// "frontier" is the highest rank they may open right now; every course with
// rank <= frontier is unlocked, everything above is locked.
//
//   Before the student starts any course:
//       frontier = placement ceiling              ("start from your level or lower")
//       (no placement yet -> ceiling 1: only the first course)
//
//   Once the student has started a course (enrolled, paid, or a payment is
//   waiting for review) the placement ceiling stops mattering — the path is
//   sequential from where they started:
//       frontier = max(highest rank they started, highest completed rank + 1)
//
//   So starting BELOW the placed level keeps everything after it locked until
//   each course is finished in turn; starting AT the placed level unlocks the
//   next course only after finishing it. Lower courses always stay open.

export interface UnlockInputs {
  /** student_level_state.max_unlocked_cefr_rank (placement ceiling), if any. */
  readonly ceiling: number | null;
  /** Highest rank among courses the student has started, if any. */
  readonly startedMax: number | null;
  /** Highest rank among courses the student has completed, if any. */
  readonly completedMax: number | null;
}

export function computeUnlockFrontier(input: UnlockInputs): number {
  const completedNext = (input.completedMax ?? 0) + 1;
  if (input.startedMax !== null && input.startedMax !== undefined) {
    return Math.max(input.startedMax, completedNext);
  }
  return Math.max(input.ceiling ?? 1, completedNext);
}

export function isRankUnlocked(rank: number | null, frontier: number): boolean {
  return rank === null || rank <= frontier;
}
