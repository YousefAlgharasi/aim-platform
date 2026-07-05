// EnrollmentService types.
//
// Scope: "Which course is this student currently enrolled in" only.

export interface EnrollmentRow {
  readonly id: string;
  readonly course_id: string;
  readonly course_title: string;
  readonly enrolled_at: string;
}

/** Safe response shape for GET /enrollment/current. */
export interface CurrentEnrollmentResponse {
  readonly found: boolean;
  readonly courseId: string | null;
  readonly courseTitle: string | null;
  readonly enrolledAt: string | null;
}

/** Safe response shape for POST /courses/:id/enroll. */
export interface EnrollResponse {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly enrolledAt: string;
}
