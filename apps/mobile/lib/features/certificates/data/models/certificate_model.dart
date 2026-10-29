import 'package:flutter/foundation.dart';

@immutable
class CertificateScoreBreakdownModel {
  const CertificateScoreBreakdownModel({
    required this.practicePoints,
    required this.practiceAccuracyPercent,
    required this.quizPoints,
    required this.quizAveragePercent,
    required this.chapterExamPoints,
    required this.chapterExamAveragePercent,
    required this.finalExamPoints,
    required this.finalExamPercent,
    required this.totalPoints,
    required this.overallPercent,
    this.practiceMaxPoints = 200,
    this.quizMaxPoints = 200,
    this.chapterExamMaxPoints = 200,
    this.finalExamMaxPoints = 400,
  });

  /// Backend-computed maximum for each component. Components the course
  /// doesn't have (or the student never did) are 0 and the others are scaled
  /// so they still add up to 1,000.
  final int practiceMaxPoints;
  final int quizMaxPoints;
  final int chapterExamMaxPoints;
  final int finalExamMaxPoints;

  /// Lesson practices score.
  final int practicePoints;
  final int practiceAccuracyPercent;

  /// Chapter quizzes score.
  final int quizPoints;
  final int quizAveragePercent;

  /// Chapter exams score.
  final int chapterExamPoints;
  final int chapterExamAveragePercent;

  /// Course final exam score.
  final int finalExamPoints;
  final int finalExamPercent;

  /// Cumulative total points earned (0 - 1,000 pts).
  final int totalPoints;

  /// Final grade percentage (0 - 100%, totalPoints / 10).
  final int overallPercent;

  factory CertificateScoreBreakdownModel.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) {
      if (v is num) return v.round();
      if (v is String) return num.tryParse(v)?.round() ?? 0;
      return 0;
    }

    return CertificateScoreBreakdownModel(
      practicePoints: toInt(json['practicePoints']),
      practiceAccuracyPercent: toInt(json['practiceAccuracyPercent']),
      quizPoints: toInt(json['quizPoints']),
      quizAveragePercent: toInt(json['quizAveragePercent']),
      chapterExamPoints: toInt(json['chapterExamPoints']),
      chapterExamAveragePercent: toInt(json['chapterExamAveragePercent']),
      finalExamPoints: toInt(json['finalExamPoints']),
      finalExamPercent: toInt(json['finalExamPercent']),
      totalPoints: toInt(json['totalPoints']),
      overallPercent: toInt(json['overallPercent']),
      practiceMaxPoints: json.containsKey('practiceMaxPoints') ? toInt(json['practiceMaxPoints']) : 200,
      quizMaxPoints: json.containsKey('quizMaxPoints') ? toInt(json['quizMaxPoints']) : 200,
      chapterExamMaxPoints: json.containsKey('chapterExamMaxPoints') ? toInt(json['chapterExamMaxPoints']) : 200,
      finalExamMaxPoints: json.containsKey('finalExamMaxPoints') ? toInt(json['finalExamMaxPoints']) : 400,
    );
  }
}

@immutable
class CertificateScoreEntryModel {
  const CertificateScoreEntryModel({
    required this.assessmentId,
    required this.title,
    required this.type,
    required this.score,
    required this.maxScore,
    required this.scorePercent,
    required this.passed,
  });

  final String assessmentId;
  final String title;
  final String type;
  final int score;
  final int maxScore;
  final int scorePercent;
  final bool passed;

  factory CertificateScoreEntryModel.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) {
      if (v is num) return v.round();
      if (v is String) return num.tryParse(v)?.round() ?? 0;
      return 0;
    }

    return CertificateScoreEntryModel(
      assessmentId: json['assessmentId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      type: json['type'] as String? ?? 'quiz',
      score: toInt(json['score']),
      maxScore: toInt(json['maxScore']),
      scorePercent: toInt(json['scorePercent']),
      passed: json['passed'] as bool? ?? false,
    );
  }
}

@immutable
class CertificateModel {
  const CertificateModel({
    required this.id,
    required this.studentId,
    required this.courseId,
    required this.courseTitle,
    required this.issuedAt,
    this.studentName,
    this.scoreSnapshot = const [],
    this.breakdown,
    this.totalPoints,
    this.overallScorePercent,
    this.verificationUrl,
  });

  final String id;
  final String studentId;
  final String courseId;
  final String courseTitle;
  final String? studentName;
  final DateTime issuedAt;
  final List<CertificateScoreEntryModel> scoreSnapshot;
  final CertificateScoreBreakdownModel? breakdown;
  final int? totalPoints;
  final int? overallScorePercent;
  final String? verificationUrl;

  factory CertificateModel.fromJson(Map<String, dynamic> json) {
    int? toIntOrNull(dynamic v) {
      if (v == null) return null;
      if (v is num) return v.round();
      if (v is String) return num.tryParse(v)?.round();
      return null;
    }

    final rawSnapshot = json['scoreSnapshot'] as List<dynamic>? ?? [];
    final snapshot = rawSnapshot
        .whereType<Map<String, dynamic>>()
        .map(CertificateScoreEntryModel.fromJson)
        .toList();

    CertificateScoreBreakdownModel? breakdown;
    if (json['breakdown'] is Map<String, dynamic>) {
      breakdown = CertificateScoreBreakdownModel.fromJson(
        json['breakdown'] as Map<String, dynamic>,
      );
    }

    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['issuedAt'] as String? ?? '');
    } catch (_) {
      parsedDate = DateTime.now();
    }

    final rawOverall = toIntOrNull(json['overallScorePercent']);
    final totalPts = toIntOrNull(json['totalPoints']) ??
        breakdown?.totalPoints ??
        (rawOverall != null ? rawOverall * 10 : null);
    final overall = rawOverall ??
        breakdown?.overallPercent ??
        (totalPts != null ? (totalPts / 10).round() : null);

    return CertificateModel(
      id: json['id'] as String? ?? '',
      studentId: json['studentId'] as String? ?? '',
      courseId: json['courseId'] as String? ?? '',
      courseTitle: json['courseTitle'] as String? ?? '',
      studentName: json['studentName'] as String?,
      issuedAt: parsedDate,
      scoreSnapshot: snapshot,
      breakdown: breakdown,
      totalPoints: totalPts,
      overallScorePercent: overall,
      verificationUrl: json['verificationUrl'] as String?,
    );
  }
}
