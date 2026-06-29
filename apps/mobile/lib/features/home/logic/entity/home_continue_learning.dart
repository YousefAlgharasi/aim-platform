// HomeContinueLearning — domain entity for the "Continue Learning" Home
// screen section.
//
// lessonTitle and percent are backend-computed/stored. Flutter never infers
// which lesson to resume locally.

class HomeContinueLearning {
  const HomeContinueLearning({
    required this.lessonId,
    required this.lessonTitle,
    required this.percent,
    required this.lastActiveAt,
  });

  final String lessonId;
  final String lessonTitle;
  final int percent;
  final String lastActiveAt;
}
