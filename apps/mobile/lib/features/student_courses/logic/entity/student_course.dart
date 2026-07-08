// StudentCourse — domain entity for an enriched course card on the mobile
// Courses screen.
//
// levelCode, lessonCount, completedLessonCount, percent, and status are all
// backend-computed from real lesson_progress data (GET /student/courses).
// Flutter never computes progress percentage or status locally.

enum StudentCourseStatus { notStarted, inProgress, completed }

StudentCourseStatus studentCourseStatusFromString(String value) =>
    switch (value) {
      'completed' => StudentCourseStatus.completed,
      'in_progress' => StudentCourseStatus.inProgress,
      _ => StudentCourseStatus.notStarted,
    };

class StudentCourse {
  const StudentCourse({
    required this.courseId,
    required this.title,
    required this.lessonCount,
    required this.completedLessonCount,
    required this.quizCount,
    required this.examCount,
    required this.percent,
    required this.status,
    required this.locked,
    this.description,
    this.levelCode,
  });

  final String courseId;
  final String title;
  final String? description;

  /// Representative CEFR-style level code (e.g. 'A1', 'B1'), or null if the
  /// course has no published level.
  final String? levelCode;

  final int lessonCount;
  final int completedLessonCount;

  /// Count of published quiz assessments across the course's chapters.
  final int quizCount;

  /// Count of published final-exam assessments for the course (0 or 1).
  final int examCount;

  /// Backend-computed: round(completed items / total items * 100), where
  /// items = lessons + chapter quizzes + the final exam.
  final int percent;

  /// Backend-computed: 'completed' requires lessons, chapter quizzes, and
  /// the final exam (if any) all done — not lessons alone.
  final StudentCourseStatus status;

  /// Backend-computed: true when the course's cefr_rank exceeds the
  /// student's max_unlocked_cefr_rank for its track. Never derived
  /// client-side — always read verbatim from the backend response.
  final bool locked;
}
