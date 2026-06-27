import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';

void main() {
  group('BackendApiPaths home endpoints', () {
    test('aimSkillStates builds correct path', () {
      expect(
        BackendApiPaths.aimSkillStates('student-1'),
        '/aim/students/student-1/skill-states',
      );
    });

    test('aimWeaknessRecords builds correct path', () {
      expect(
        BackendApiPaths.aimWeaknessRecords('student-1'),
        '/aim/students/student-1/weakness-records',
      );
    });

    test('aimReviewSchedules builds correct path', () {
      expect(
        BackendApiPaths.aimReviewSchedules('student-1'),
        '/aim/students/student-1/review-schedules',
      );
    });

    test('aimRecommendations builds correct path', () {
      expect(
        BackendApiPaths.aimRecommendations('student-1'),
        '/aim/students/student-1/recommendations',
      );
    });
  });

  group('HomeSkillStateModel security', () {
    test('masteryScore and masteryTrend stored verbatim from backend — no local computation', () {
      final model = HomeSkillStateModel.fromJson(const {
        'skillId': 'skill-grammar',
        'masteryScore': 0.62,
        'masteryConfidence': 0.8,
        'masteryTrend': 'improving',
        'lastAttemptId': 'attempt-1',
        'lastEvaluatedAt': '2026-06-18T00:00:00Z',
        'updatedAt': '2026-06-18T00:00:00Z',
      });
      expect(model.masteryScore, 0.62);
      expect(model.masteryTrend, 'improving');
    });
  });

  group('HomeWeaknessRecordModel security', () {
    test('severity stored verbatim from backend', () {
      final model = HomeWeaknessRecordModel.fromJson(const {
        'weaknessId': 'weak-1',
        'skillId': 'skill-reading',
        'severity': 'high',
        'status': 'open',
        'triggerAttemptIds': ['attempt-1'],
        'detectedAt': '2026-06-18T00:00:00Z',
        'updatedAt': '2026-06-18T00:00:00Z',
      });
      expect(model.severity, 'high');
    });
  });

  group('HomeRecommendationModel security', () {
    test('kind and reason stored verbatim from backend — never generated locally', () {
      final model = HomeRecommendationModel.fromJson(const {
        'id': 'rec-1',
        'kind': 'review',
        'targetSkillId': 'skill-vocabulary',
        'rank': 1,
        'reason': 'Three missed reviews',
        'generatedAt': '2026-06-18T00:00:00Z',
        'status': 'active',
        'updatedAt': '2026-06-18T00:00:00Z',
      });
      expect(model.kind, 'review');
      expect(model.reason, 'Three missed reviews');
    });
  });

  group('HomeReviewScheduleModel', () {
    test('status and dueAt stored verbatim', () {
      final model = HomeReviewScheduleModel.fromJson(const {
        'scheduleId': 'sched-1',
        'skillId': 'skill-grammar',
        'dueAt': '2026-06-19T08:00:00Z',
        'intervalDays': 3,
        'repetitionCount': 1,
        'status': 'high',
        'basedOnAttemptId': 'attempt-1',
        'scheduledAt': '2026-06-16T08:00:00Z',
        'updatedAt': '2026-06-16T08:00:00Z',
      });
      expect(model.status, 'high');
      expect(model.dueAt, '2026-06-19T08:00:00Z');
    });
  });
}
