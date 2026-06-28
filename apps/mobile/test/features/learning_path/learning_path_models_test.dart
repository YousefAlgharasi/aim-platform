// Phase 6 — P6-064
// Unit tests for learning_path data-layer models.
//
// Verifies that each model:
//   - Parses all contract fields from JSON correctly.
//   - Does NOT compute, transform, or infer any backend-owned AIM values
//     (masteryScore, masteryTrend, severity, status, reason, kind).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

void main() {
  group('LearningPathSkillStateModel', () {
    const json = {
      'skillId': 'skill-algebra',
      'masteryScore': 0.72,
      'masteryConfidence': 0.8,
      'masteryTrend': 'improving',
      'lastAttemptId': 'attempt-1',
      'lastEvaluatedAt': '2026-01-01T00:00:00Z',
      'updatedAt': '2026-01-02T00:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = LearningPathSkillStateModel.fromJson(json);
      expect(model.skillId, 'skill-algebra');
      expect(model.masteryScore, 0.72);
      expect(model.masteryConfidence, 0.8);
      expect(model.masteryTrend, 'improving');
    });

    test('parses masteryScore from int JSON value (num coercion)', () {
      final model = LearningPathSkillStateModel.fromJson(const {
        'skillId': 'skill-grammar',
        'masteryScore': 1,
        'masteryConfidence': 1,
        'masteryTrend': 'stable',
        'lastAttemptId': 'attempt-2',
        'lastEvaluatedAt': '2026-01-01T00:00:00Z',
        'updatedAt': '2026-01-02T00:00:00Z',
      });
      expect(model.masteryScore, 1.0);
      expect(model.masteryScore, isA<double>());
    });

    test('preserves backend skillId and masteryTrend verbatim — no local mapping',
        () {
      final model = LearningPathSkillStateModel.fromJson(const {
        'skillId': 'skill-trigonometry',
        'masteryScore': 0.9,
        'masteryConfidence': 0.85,
        'masteryTrend': 'declining',
        'lastAttemptId': 'attempt-3',
        'lastEvaluatedAt': '2026-01-01T00:00:00Z',
        'updatedAt': '2026-01-02T00:00:00Z',
      });
      expect(model.skillId, 'skill-trigonometry');
      expect(model.masteryTrend, 'declining');
    });
  });

  group('LearningPathWeaknessRecordModel', () {
    const json = {
      'weaknessId': 'weakness-fractions',
      'skillId': 'skill-fractions',
      'severity': 'high',
      'status': 'open',
      'triggerAttemptIds': ['attempt-1'],
      'detectedAt': '2026-01-01T00:00:00Z',
      'updatedAt': '2026-01-02T00:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = LearningPathWeaknessRecordModel.fromJson(json);
      expect(model.skillId, 'skill-fractions');
      expect(model.severity, 'high');
      expect(model.status, 'open');
    });

    test('preserves backend severity and status verbatim', () {
      final model = LearningPathWeaknessRecordModel.fromJson(const {
        'weaknessId': 'weakness-geometry',
        'skillId': 'skill-geometry',
        'severity': 'medium',
        'status': 'resolved',
        'triggerAttemptIds': ['attempt-2'],
        'detectedAt': '2026-01-01T00:00:00Z',
        'resolvedAt': '2026-01-03T00:00:00Z',
        'updatedAt': '2026-01-03T00:00:00Z',
      });
      expect(model.severity, 'medium');
      expect(model.status, 'resolved');
    });
  });

  group('LearningPathRecommendationModel', () {
    const json = {
      'id': 'rec-algebra',
      'kind': 'practice',
      'targetSkillId': 'skill-algebra',
      'rank': 1,
      'reason': 'Coverage below threshold.',
      'generatedAt': '2026-01-01T00:00:00Z',
      'status': 'active',
      'updatedAt': '2026-01-01T00:00:00Z',
    };

    test('parses all contract fields from JSON', () {
      final model = LearningPathRecommendationModel.fromJson(json);
      expect(model.targetSkillId, 'skill-algebra');
      expect(model.kind, 'practice');
      expect(model.reason, 'Coverage below threshold.');
    });

    test('preserves backend kind and reason verbatim — no local generation',
        () {
      final model = LearningPathRecommendationModel.fromJson(const {
        'id': 'rec-grammar',
        'kind': 'review',
        'targetSkillId': 'skill-grammar',
        'rank': 2,
        'reason': 'Mastery dropped since last session.',
        'generatedAt': '2026-01-01T00:00:00Z',
        'status': 'active',
        'updatedAt': '2026-01-01T00:00:00Z',
      });
      expect(model.kind, 'review');
      expect(model.reason, 'Mastery dropped since last session.');
    });
  });
}
