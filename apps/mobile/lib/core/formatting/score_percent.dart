// scorePercent — shared display-only formatting helper.
//
// Turns two backend-supplied numbers (points earned, points possible) into
// a rounded percentage for display. This is NOT grading: it never decides
// pass/fail, correctness, or eligibility — those come verbatim from the
// backend (e.g. AttemptResultModel.passed). It exists in core/ rather than
// inline in features/assessments/ so a single, obviously-inert formatting
// helper is shared instead of duplicated per screen.
//
// Returns null when [denominator] is not positive, so callers can fall back
// to showing the raw points instead of dividing by zero.
int? scorePercent({required double numerator, required double denominator}) {
  if (denominator <= 0) return null;
  return ((numerator / denominator) * 100).round();
}
