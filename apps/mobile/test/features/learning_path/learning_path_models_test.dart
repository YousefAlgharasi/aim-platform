// Phase 6 — P6-064
// Unit tests for learning_path data-layer models.
//
// Verifies that each model:
//   - Parses all contract fields from JSON correctly.
//   - Re-serialises to JSON without data loss.
//   - Does NOT compute, transform, or infer any backend-owned AIM values
//     (band, masteryLevel, coveragePercent, severity, recommendedFocus,
//      action, reason).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

void main() {
  group('LearningPathSkillStateModel', () {
    const json = {
      'topic': 'algebra',
      'band': 'Proficient',
      'masteryLevel': 'strong',
      'coveragePercent': 72.5,
    };

    test('parses all contract fields from JSON', () {
      final model = LearningPathSkillStateModel.fromJson(json);
      expect(model.topic, 'algebra');
      expect(model.band, 'Proficient');
      expect(model.masteryLevel, 'strong');
      expect(model.coveragePercent, 72.5);
    });

    test('round-trips through toJson without data loss', () {
      final model = LearningPathSkillStateModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('parses coveragePercent from int JSON value (num coercion)', () {
      final model = LearningPathSkillStateModel.fromJson(const {
        'topic': 'grammar',
        'band': 'Developing',
        'masteryLevel': 'emerging',
        'coveragePercent': 50,
      });
      expect(model.coveragePercent, 50.0);
      expect(model.coveragePercent, isA<double>());
    });

    test('preserves backend band and masteryLevel verbatim — no local mapping',
        () {
      final model = LearningPathSkillStateModel.fromJson(const {
        'topic': 'trigonometry',
        'band': 'Advanced',
        'masteryLevel': 'proficient',
        'coveragePercent': 90.0,
      });
      expect(model.band, 'Advanced');
      expect(model.masteryLevel, 'proficient');
    });
  });

  group('LearningPathWeaknessRecordModel', () {
    const json = {
      'topic': 'fractions',
      'severity': 'high',
      'recommendedFocus': 'equivalent fractions',
    };

    test('parses all contract fields from JSON', () {
      final model = LearningPathWeaknessRecordModel.fromJson(json);
      expect(model.topic, 'fractions');
      expect(model.severity, 'high');
      expect(model.recommendedFocus, 'equivalent fractions');
    });

    test('round-trips through toJson without data loss', () {
      final model = LearningPathWeaknessRecordModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('preserves backend severity and recommendedFocus verbatim', () {
      final model = LearningPathWeaknessRecordModel.fromJson(const {
        'topic': 'geometry',
        'severity': 'medium',
        'recommendedFocus': 'area of polygons',
      });
      expect(model.severity, 'medium');
      expect(model.recommendedFocus, 'area of polygons');
    });
  });

  group('LearningPathRecommendationModel', () {
    const json = {
      'topic': 'algebra',
      'action': 'practice',
      'reason': 'Coverage below threshold.',
    };

    test('parses all contract fields from JSON', () {
      final model = LearningPathRecommendationModel.fromJson(json);
      expect(model.topic, 'algebra');
      expect(model.action, 'practice');
      expect(model.reason, 'Coverage below threshold.');
    });

    test('round-trips through toJson without data loss', () {
      final model = LearningPathRecommendationModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('preserves backend action and reason verbatim — no local generation',
        () {
      final model = LearningPathRecommendationModel.fromJson(const {
        'topic': 'grammar',
        'action': 'review',
        'reason': 'Mastery dropped since last session.',
      });
      expect(model.action, 'review');
      expect(model.reason, 'Mastery dropped since last session.');
    });
  });
}
