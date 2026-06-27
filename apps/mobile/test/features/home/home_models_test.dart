// Phase 6 — P6-059
// Unit tests for home data-layer models.
//
// Verifies that each model:
//   - Parses all contract fields from JSON correctly.
//   - Does NOT compute, transform, or infer any backend-owned values
//     (masteryScore, masteryTrend, severity, status, kind, reason).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/home/data/models/home_models.dart';

void main() {
  group('HomeSkillStateModel', () {
    const json = {
      'skillId': 'skill-algebra',
      'masteryScore': 0.45,
      'masteryConfidence': 0.7,
      'masteryTrend': 'developing',
      'lastAttemptId': 'attempt-1',
      'lastEvaluatedAt': '2026-06-17T10:00:00Z',
      'updatedAt': '2026-06-17T10:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeSkillStateModel.fromJson(json);
      expect(model.skillId, 'skill-algebra');
      expect(model.masteryScore, 0.45);
      expect(model.masteryTrend, 'developing');
    });

    test('does not compute or transform masteryScore or masteryTrend', () {
      // Any value the backend sends must be preserved verbatim.
      final model = HomeSkillStateModel.fromJson(const {
        'skillId': 'skill-grammar',
        'masteryScore': 0.91,
        'masteryConfidence': 0.85,
        'masteryTrend': 'advanced',
        'lastAttemptId': 'attempt-2',
        'lastEvaluatedAt': '2026-06-17T10:00:00Z',
        'updatedAt': '2026-06-17T10:00:00Z',
      });
      expect(model.masteryScore, 0.91);
      expect(model.masteryTrend, 'advanced');
    });
  });

  group('HomeWeaknessRecordModel', () {
    const json = {
      'weaknessId': 'weak-1',
      'skillId': 'skill-trigonometry',
      'severity': 'high',
      'status': 'open',
      'triggerAttemptIds': ['attempt-1'],
      'detectedAt': '2026-06-17T10:00:00Z',
      'updatedAt': '2026-06-17T10:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeWeaknessRecordModel.fromJson(json);
      expect(model.skillId, 'skill-trigonometry');
      expect(model.severity, 'high');
      expect(model.updatedAt, '2026-06-17T10:00:00Z');
    });

    test('preserves backend severity verbatim — no local mapping applied', () {
      final model = HomeWeaknessRecordModel.fromJson(const {
        'weaknessId': 'weak-2',
        'skillId': 'skill-fractions',
        'severity': 'low',
        'status': 'open',
        'triggerAttemptIds': ['attempt-1'],
        'detectedAt': '2026-06-01T00:00:00Z',
        'updatedAt': '2026-06-01T00:00:00Z',
      });
      expect(model.severity, 'low');
    });
  });

  group('HomeReviewScheduleModel', () {
    const json = {
      'scheduleId': 'sched-1',
      'skillId': 'skill-quadratics',
      'dueAt': '2026-06-20T08:00:00Z',
      'intervalDays': 5,
      'repetitionCount': 2,
      'status': 'urgent',
      'basedOnAttemptId': 'attempt-1',
      'scheduledAt': '2026-06-15T08:00:00Z',
      'updatedAt': '2026-06-15T08:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeReviewScheduleModel.fromJson(json);
      expect(model.skillId, 'skill-quadratics');
      expect(model.dueAt, '2026-06-20T08:00:00Z');
      expect(model.status, 'urgent');
    });

    test('preserves backend status verbatim — Flutter must not reorder', () {
      final model = HomeReviewScheduleModel.fromJson(const {
        'scheduleId': 'sched-2',
        'skillId': 'skill-geometry',
        'dueAt': '2026-06-25T00:00:00Z',
        'intervalDays': 7,
        'repetitionCount': 1,
        'status': 'normal',
        'basedOnAttemptId': 'attempt-2',
        'scheduledAt': '2026-06-18T00:00:00Z',
        'updatedAt': '2026-06-18T00:00:00Z',
      });
      expect(model.status, 'normal');
    });
  });

  group('HomeRecommendationModel', () {
    const json = {
      'id': 'rec-1',
      'kind': 'review',
      'targetSkillId': 'skill-algebra',
      'rank': 1,
      'reason': 'Mastery has decreased since last session.',
      'generatedAt': '2026-06-17T10:00:00Z',
      'status': 'active',
      'updatedAt': '2026-06-17T10:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeRecommendationModel.fromJson(json);
      expect(model.targetSkillId, 'skill-algebra');
      expect(model.kind, 'review');
      expect(model.reason, 'Mastery has decreased since last session.');
    });

    test('preserves backend kind and reason verbatim — no local generation',
        () {
      final model = HomeRecommendationModel.fromJson(const {
        'id': 'rec-2',
        'kind': 'practice',
        'targetSkillId': 'skill-grammar',
        'rank': 2,
        'reason': 'Low coverage detected.',
        'generatedAt': '2026-06-17T10:00:00Z',
        'status': 'active',
        'updatedAt': '2026-06-17T10:00:00Z',
      });
      expect(model.kind, 'practice');
      expect(model.reason, 'Low coverage detected.');
    });
  });
}
