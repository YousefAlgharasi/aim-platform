// HomeQuickStartLessonModel — data-layer model.
//
// Parses GET /lessons/quick-start.
// Backend derives the next lesson from the student's placement result.

import '../../logic/entity/home_quick_start_lesson.dart';

class HomeQuickStartLessonModel extends HomeQuickStartLesson {
  const HomeQuickStartLessonModel({
    required super.lessonId,
    required super.lessonTitle,
    required super.lessonDescription,
    super.skillName,
  });

  factory HomeQuickStartLessonModel.fromJson(Map<String, dynamic> json) {
    return HomeQuickStartLessonModel(
      lessonId: json['lessonId'] as String,
      lessonTitle: json['lessonTitle'] as String,
      lessonDescription: json['lessonDescription'] as String,
      skillName: json['skillName'] as String?,
    );
  }
}
