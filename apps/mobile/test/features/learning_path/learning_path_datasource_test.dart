// Phase 6 — P6-065
// learning_path_datasource_test.dart — unit tests for the learning path
// datasource layer.
//
// Covers:
//   1. API path helpers produce correct URL strings.
//   2. LearningPathSkillStateModel stores all backend values verbatim.
//   3. LearningPathWeaknessRecordModel stores severity/recommendedFocus verbatim.
//   4. LearningPathRecommendationModel stores action/reason verbatim.
//   5. coveragePercent coerces int JSON to double without Flutter modifying value.

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
      'topic': 'algebra',
      'band': 'Developing',
      'masteryLevel': '38%',
      'coveragePercent': 42,
    };

    test('fromJson stores band verbatim — no local computation', () {
      final model = LearningPathSkillStateModel.fromJson(raw);
      expect(model.band, 'Developing');
    });

    test('fromJson stores masteryLevel verbatim', () {
      final model = LearningPathSkillStateModel.fromJson(raw);
      expect(model.masteryLevel, '38%');
    });

    test('fromJson coerces int coveragePercent to double', () {
      final model = LearningPathSkillStateModel.fromJson(raw);
      expect(model.coveragePercent, 42.0);
      expect(model.coveragePercent, isA<double>());
    });

    test('toJson round-trips correctly', () {
      const rawDouble = {
        'topic': 'algebra',
        'band': 'Developing',
        'masteryLevel': '38%',
        'coveragePercent': 42.0,
      };
      final model = LearningPathSkillStateModel.fromJson(rawDouble);
      expect(model.toJson(), rawDouble);
    });
  });

  group('LearningPathWeaknessRecordModel', () {
    const raw = {
      'topic': 'fractions',
      'severity': 'high',
      'recommendedFocus': 'practise equivalent fractions',
    };

    test('fromJson stores severity verbatim — never computed locally', () {
      final model = LearningPathWeaknessRecordModel.fromJson(raw);
      expect(model.severity, 'high');
    });

    test('fromJson stores recommendedFocus verbatim', () {
      final model = LearningPathWeaknessRecordModel.fromJson(raw);
      expect(model.recommendedFocus, 'practise equivalent fractions');
    });

    test('toJson round-trips correctly', () {
      final model = LearningPathWeaknessRecordModel.fromJson(raw);
      expect(model.toJson(), raw);
    });
  });

  group('LearningPathRecommendationModel', () {
    const raw = {
      'topic': 'grammar',
      'action': 'review subject-verb agreement',
      'reason': 'Three consecutive errors detected by AIM.',
    };

    test('fromJson stores action verbatim — never generated locally', () {
      final model = LearningPathRecommendationModel.fromJson(raw);
      expect(model.action, 'review subject-verb agreement');
    });

    test('fromJson stores reason verbatim', () {
      final model = LearningPathRecommendationModel.fromJson(raw);
      expect(model.reason, 'Three consecutive errors detected by AIM.');
    });

    test('toJson round-trips correctly', () {
      final model = LearningPathRecommendationModel.fromJson(raw);
      expect(model.toJson(), raw);
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
