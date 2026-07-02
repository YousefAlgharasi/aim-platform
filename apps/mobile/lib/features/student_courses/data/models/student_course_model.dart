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
    required super.percent,
    required super.status,
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
      percent: json['percent'] as int,
      status: studentCourseStatusFromString(json['status'] as String),
    );
  }
}
