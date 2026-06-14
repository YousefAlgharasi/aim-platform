// Phase 3 — P3-047
// Shared validation error type for curriculum request payloads.
//
// Matches the "Safe Client Error Shape" defined in
// packages/shared-contracts/api/errors.md (P3-016):
//
// {
//   "success": false,
//   "data": null,
//   "error": {
//     "code": "LESSON_MISSING_SKILL",
//     "message": "Lesson must be linked to at least one skill",
//     "details": [{ "field": "skills", "message": "..." }]
//   }
// }
//
// Backend controllers/filters are responsible for mapping this error to the
// HTTP status documented for each CurriculumErrorCode in errors.md. This
// validation layer only carries the code, safe message, and field details.

import { CurriculumErrorCode } from './curriculum-error-code';

export interface CurriculumValidationDetail {
  field: string;
  message: string;
}

export class CurriculumValidationError extends Error {
  constructor(
    readonly code: CurriculumErrorCode,
    message: string,
    readonly details: readonly CurriculumValidationDetail[] = [],
  ) {
    super(message);
    this.name = 'CurriculumValidationError';
  }
}
