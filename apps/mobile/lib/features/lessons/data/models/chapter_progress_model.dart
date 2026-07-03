// ChapterProgressModel — data-layer model for ChapterProgress.
//
// Parses one entry of GET /student/chapters?levelId= (StudentChapterSummary,
// student-chapters.types.ts). All fields are backend-supplied verbatim —
// Flutter never computes percent, completedLessonCount, or status.

import '../../logic/entity/chapter_progress.dart';

class ChapterProgressModel extends ChapterProgress {
  const ChapterProgressModel({
    required super.chapterId,
    required super.title,
    required super.description,
    required super.levelCode,
    required super.lessonCount,
    required super.completedLessonCount,
    required super.percent,
    required super.status,
  });

  factory ChapterProgressModel.fromJson(Map<String, dynamic> json) {
    return ChapterProgressModel(
      chapterId: json['chapterId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      levelCode: json['levelCode'] as String?,
      lessonCount: (json['lessonCount'] as num).toInt(),
      completedLessonCount: (json['completedLessonCount'] as num).toInt(),
      percent: (json['percent'] as num).toInt(),
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'chapterId': chapterId,
        'title': title,
        'description': description,
        'levelCode': levelCode,
        'lessonCount': lessonCount,
        'completedLessonCount': completedLessonCount,
        'percent': percent,
        'status': status,
      };
}
