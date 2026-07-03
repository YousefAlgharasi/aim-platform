// LessonProgressModel — data-layer model for LessonProgress.
//
// Parses one entry of GET /student/lessons?chapterId= (StudentLessonSummary,
// student-lessons.types.ts). All fields are backend-supplied verbatim —
// Flutter never computes completed or current.

import '../../logic/entity/lesson_progress.dart';

class LessonProgressModel extends LessonProgress {
  const LessonProgressModel({
    required super.id,
    required super.title,
    required super.description,
    required super.xpValue,
    required super.completed,
    required super.current,
  });

  factory LessonProgressModel.fromJson(Map<String, dynamic> json) {
    return LessonProgressModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      xpValue: (json['xpValue'] as num?)?.toInt() ?? 0,
      completed: json['completed'] as bool? ?? false,
      current: json['current'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'xpValue': xpValue,
        'completed': completed,
        'current': current,
      };
}
