// HomeContinueLearningModel — data-layer model.
//
// Parses GET /lessons/continue.
// Backend is the sole authority for which lesson to resume.

import '../../logic/entity/home_continue_learning.dart';

class HomeContinueLearningModel extends HomeContinueLearning {
  const HomeContinueLearningModel({
    required super.lessonId,
    required super.lessonTitle,
    required super.percent,
    required super.lastActiveAt,
  });

  factory HomeContinueLearningModel.fromJson(Map<String, dynamic> json) {
    return HomeContinueLearningModel(
      lessonId: json['lessonId'] as String,
      lessonTitle: json['lessonTitle'] as String,
      percent: (json['percent'] as num).toInt(),
      lastActiveAt: json['lastActiveAt'] as String,
    );
  }
}
