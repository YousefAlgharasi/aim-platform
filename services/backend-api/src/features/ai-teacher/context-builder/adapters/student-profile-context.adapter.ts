// P8-029: Add Student Profile Context
// Backend-approved, read-only adapter that maps a student's safe profile
// fields (Phase 2 student_profiles, via StudentsService) into the shape
// the Context Builder (Group D) embeds in AI Teacher prompt context.
//
// Source: services/backend-api/src/features/students/students.service.ts
// (StudentsService.findByUserId), the same safe-field set already exposed
// to clients via GET /profile/me (docs/phase-2/safe-auth-fields.md).
//
// Authority boundary:
//   - studentId must already be the backend-resolved, authenticated
//     studentId for the session; this adapter does not resolve identity
//     or perform JWT/ownership checks itself.
//   - Only display_name, preferred_language, and timezone are surfaced —
//     no mastery, level, weakness, difficulty, recommendation, or
//     review-schedule field exists in student_profiles, so none can leak
//     through this adapter.
//   - Returns null when no profile row exists; never throws for a missing
//     profile, since profile context is optional for an AI Teacher turn.

import { Injectable } from '@nestjs/common';

import { StudentsService } from '../../../students/students.service';

export interface StudentProfileContext {
  readonly displayName: string | null;
  readonly preferredLanguage: string | null;
  readonly timezone: string | null;
}

@Injectable()
export class StudentProfileContextAdapter {
  constructor(private readonly students: StudentsService) {}

  async getProfileContext(studentId: string): Promise<StudentProfileContext | null> {
    const profile = await this.students.findByUserId(studentId);

    if (!profile) {
      return null;
    }

    return {
      displayName: profile.displayName,
      preferredLanguage: profile.preferredLanguage,
      timezone: profile.timezone,
    };
  }
}
