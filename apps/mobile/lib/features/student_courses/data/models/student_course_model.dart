// StudentCourseModel — data-layer model for StudentCourse.
//
// Parses StudentCourseSummary items from GET /student/courses.
// All fields are backend-supplied verbatim. Flutter never computes
// percent or status locally.

import '../../logic/entity/student_course.dart';

class StudentCourseModel extends StudentCourse {
  const StudentCourseModel({
    required super.courseId,
    required super.title,
    required super.lessonCount,
    required super.completedLessonCount,
    required super.quizCount,
    required super.examCount,
    required super.percent,
    required super.status,
    required super.locked,
    super.description,
    super.levelCode,
  });

  factory StudentCourseModel.fromJson(Map<String, dynamic> json) {
    return StudentCourseModel(
      courseId: json['courseId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      levelCode: json['levelCode'] as String?,
      lessonCount: json['lessonCount'] as int,
      completedLessonCount: json['completedLessonCount'] as int,
      quizCount: json['quizCount'] as int? ?? 0,
      examCount: json['examCount'] as int? ?? 0,
      percent: json['percent'] as int,
      status: studentCourseStatusFromString(json['status'] as String),
      locked: json['locked'] as bool,
    );
  }
}
