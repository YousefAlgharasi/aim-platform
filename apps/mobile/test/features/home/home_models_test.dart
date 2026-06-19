// Phase 6 — P6-059
// Unit tests for home data-layer models.
//
// Verifies that each model:
//   - Parses all contract fields from JSON correctly.
//   - Re-serialises to JSON without data loss.
//   - Does NOT compute, transform, or infer any backend-owned values
//     (band, masteryLevel, severity, priority, action, reason).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/home/data/models/home_models.dart';

void main() {
  group('HomeSkillStateModel', () {
    const json = {
      'topic': 'algebra',
      'band': 'Developing',
      'masteryLevel': 'emerging',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeSkillStateModel.fromJson(json);
      expect(model.topic, 'algebra');
      expect(model.band, 'Developing');
      expect(model.masteryLevel, 'emerging');
    });

    test('round-trips through toJson without data loss', () {
      final model = HomeSkillStateModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('does not compute or transform band or masteryLevel', () {
      // Any value the backend sends must be preserved verbatim.
      final model = HomeSkillStateModel.fromJson(const {
        'topic': 'grammar',
        'band': 'Advanced',
        'masteryLevel': 'strong',
      });
      expect(model.band, 'Advanced');
      expect(model.masteryLevel, 'strong');
    });
  });

  group('HomeWeaknessRecordModel', () {
    const json = {
      'topic': 'trigonometry',
      'severity': 'high',
      'lastUpdated': '2026-06-17T10:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeWeaknessRecordModel.fromJson(json);
      expect(model.topic, 'trigonometry');
      expect(model.severity, 'high');
      expect(model.lastUpdated, '2026-06-17T10:00:00Z');
    });

    test('round-trips through toJson without data loss', () {
      final model = HomeWeaknessRecordModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('preserves backend severity verbatim — no local mapping applied', () {
      final model = HomeWeaknessRecordModel.fromJson(const {
        'topic': 'fractions',
        'severity': 'low',
        'lastUpdated': '2026-06-01T00:00:00Z',
      });
      expect(model.severity, 'low');
    });
  });

  group('HomeReviewScheduleModel', () {
    const json = {
      'topic': 'quadratics',
      'dueAt': '2026-06-20T08:00:00Z',
      'priority': 'urgent',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeReviewScheduleModel.fromJson(json);
      expect(model.topic, 'quadratics');
      expect(model.dueAt, '2026-06-20T08:00:00Z');
      expect(model.priority, 'urgent');
    });

    test('round-trips through toJson without data loss', () {
      final model = HomeReviewScheduleModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('preserves backend priority verbatim — Flutter must not reorder', () {
      final model = HomeReviewScheduleModel.fromJson(const {
        'topic': 'geometry',
        'dueAt': '2026-06-25T00:00:00Z',
        'priority': 'normal',
      });
      expect(model.priority, 'normal');
    });
  });

  group('HomeRecommendationModel', () {
    const json = {
      'topic': 'algebra',
      'action': 'review',
      'reason': 'Mastery has decreased since last session.',
    };

    test('parses all contract fields from JSON', () {
      final model = HomeRecommendationModel.fromJson(json);
      expect(model.topic, 'algebra');
      expect(model.action, 'review');
      expect(model.reason, 'Mastery has decreased since last session.');
    });

    test('round-trips through toJson without data loss', () {
      final model = HomeRecommendationModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('preserves backend action and reason verbatim — no local generation',
        () {
      final model = HomeRecommendationModel.fromJson(const {
        'topic': 'grammar',
        'action': 'practice',
        'reason': 'Low coverage detected.',
      });
      expect(model.action, 'practice');
      expect(model.reason, 'Low coverage detected.');
    });
  });
}
