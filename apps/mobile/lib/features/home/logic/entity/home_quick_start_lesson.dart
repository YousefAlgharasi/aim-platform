// HomeQuickStartLesson — domain entity for the "Quick Start" Home section.
//
// lessonTitle, lessonDescription, and skillName are backend-derived from the
// student's placement result. Flutter never selects the lesson locally.

class HomeQuickStartLesson {
  const HomeQuickStartLesson({
    required this.lessonId,
    required this.lessonTitle,
    required this.lessonDescription,
    this.skillName,
  });

  final String lessonId;
  final String lessonTitle;
  final String lessonDescription;
  final String? skillName;
}
