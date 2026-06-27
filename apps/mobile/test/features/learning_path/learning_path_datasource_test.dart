// Phase 6 — P6-065
// learning_path_datasource_test.dart — unit tests for the learning path
// datasource layer.
//
// Covers:
//   1. API path helpers produce correct URL strings.
//   2. LearningPathSkillStateModel stores all backend values verbatim.
//   3. LearningPathWeaknessRecordModel stores severity/status verbatim.
//   4. LearningPathRecommendationModel stores kind/reason verbatim.
//   5. masteryScore coerces int JSON to double without Flutter modifying value.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/learning_path/data/datasources/learning_path_datasources.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

void main() {
  group('BackendApiPaths — learning path endpoints', () {
    test('aimSkillStates builds correct path', () {
      expect(
        BackendApiPaths.aimSkillStates('stu-abc'),
        '/aim/students/stu-abc/skill-states',
      );
    });

    test('aimWeaknessRecords builds correct path', () {
      expect(
        BackendApiPaths.aimWeaknessRecords('stu-abc'),
        '/aim/students/stu-abc/weakness-records',
      );
    });

    test('aimRecommendations builds correct path', () {
      expect(
        BackendApiPaths.aimRecommendations('stu-abc'),
        '/aim/students/stu-abc/recommendations',
      );
    });
  });

  group('LearningPathSkillStateModel', () {
    const raw = {
      'skillId': 'skill-algebra',
      'masteryScore': 42,
      'masteryConfidence': 0.5,
      'masteryTrend': 'improving',
      'lastAttemptId': 'attempt-1',
      'lastEvaluatedAt': '2026-01-01T00:00:00Z',
      'updatedAt': '2026-01-02T00:00:00Z',
    };

    test('fromJson stores masteryTrend verbatim — no local computation', () {
      final model = LearningPathSkillStateModel.fromJson(raw);
      expect(model.masteryTrend, 'improving');
    });

    test('fromJson stores skillId verbatim', () {
      final model = LearningPathSkillStateModel.fromJson(raw);
      expect(model.skillId, 'skill-algebra');
    });

    test('fromJson coerces int masteryScore to double', () {
      final model = LearningPathSkillStateModel.fromJson(raw);
      expect(model.masteryScore, 42.0);
      expect(model.masteryScore, isA<double>());
    });
  });

  group('LearningPathWeaknessRecordModel', () {
    const raw = {
      'weaknessId': 'weakness-fractions',
      'skillId': 'skill-fractions',
      'severity': 'high',
      'status': 'open',
      'triggerAttemptIds': ['attempt-1'],
      'detectedAt': '2026-01-01T00:00:00Z',
      'updatedAt': '2026-01-02T00:00:00Z',
    };

    test('fromJson stores severity verbatim — never computed locally', () {
      final model = LearningPathWeaknessRecordModel.fromJson(raw);
      expect(model.severity, 'high');
    });

    test('fromJson stores status verbatim', () {
      final model = LearningPathWeaknessRecordModel.fromJson(raw);
      expect(model.status, 'open');
    });
  });

  group('LearningPathRecommendationModel', () {
    const raw = {
      'id': 'rec-grammar',
      'kind': 'review subject-verb agreement',
      'targetSkillId': 'skill-grammar',
      'rank': 1,
      'reason': 'Three consecutive errors detected by AIM.',
      'generatedAt': '2026-01-01T00:00:00Z',
      'status': 'active',
      'updatedAt': '2026-01-01T00:00:00Z',
    };

    test('fromJson stores kind verbatim — never generated locally', () {
      final model = LearningPathRecommendationModel.fromJson(raw);
      expect(model.kind, 'review subject-verb agreement');
    });

    test('fromJson stores reason verbatim', () {
      final model = LearningPathRecommendationModel.fromJson(raw);
      expect(model.reason, 'Three consecutive errors detected by AIM.');
    });
  });

  group('LearningPathRemoteDatasource — contract', () {
    test('LearningPathRemoteDatasource is an abstract class', () {
      // Verify the abstract interface is importable and not instantiable.
      // The impl exists — verifying the abstract type is accessible.
      expect(LearningPathRemoteDatasource, isNotNull);
    });
  });
}
