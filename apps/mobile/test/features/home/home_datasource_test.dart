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
    test('band and masteryLevel stored verbatim from backend — no local computation', () {
      final model = HomeSkillStateModel.fromJson(const {
        'topic': 'grammar',
        'band': 'Proficient',
        'masteryLevel': 'intermediate',
      });
      expect(model.band, 'Proficient');
      expect(model.masteryLevel, 'intermediate');
    });
  });

  group('HomeWeaknessRecordModel security', () {
    test('severity stored verbatim from backend', () {
      final model = HomeWeaknessRecordModel.fromJson(const {
        'topic': 'reading',
        'severity': 'high',
        'lastUpdated': '2026-06-18T00:00:00Z',
      });
      expect(model.severity, 'high');
    });
  });

  group('HomeRecommendationModel security', () {
    test('action and reason stored verbatim from backend — never generated locally', () {
      final model = HomeRecommendationModel.fromJson(const {
        'topic': 'vocabulary',
        'action': 'review',
        'reason': 'Three missed reviews',
      });
      expect(model.action, 'review');
      expect(model.reason, 'Three missed reviews');
    });
  });

  group('HomeReviewScheduleModel', () {
    test('priority and dueAt stored verbatim', () {
      final model = HomeReviewScheduleModel.fromJson(const {
        'topic': 'grammar',
        'dueAt': '2026-06-19T08:00:00Z',
        'priority': 'high',
      });
      expect(model.priority, 'high');
      expect(model.dueAt, '2026-06-19T08:00:00Z');
    });
  });
}
