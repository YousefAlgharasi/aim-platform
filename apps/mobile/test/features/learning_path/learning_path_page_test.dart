// Phase 6 — P6-068
// learning_path_page_test.dart — widget tests for LearningPathPage.
//
// Covers:
//   1. Loading state renders without crash (AIMFullScreenLoading).
//   2. Error state renders error message.
//   3. Empty success state renders AIMEmptyState.
//   4. Populated success state renders all three section headers.
//   5. RTL layout renders without error; section headers present.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';
import 'package:aim_mobile/features/learning_path/logic/entity/learning_path_data.dart';
import 'package:aim_mobile/features/learning_path/logic/provider/learning_path_provider.dart';
import 'package:aim_mobile/features/learning_path/ui/pages/learning_path_page.dart';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

Widget _wrap(
  Widget child, {
  List<Override> overrides = const [],
  TextDirection dir = TextDirection.ltr,
}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(
      theme: AppTheme.light,
      home: Directionality(
        textDirection: dir,
        child: child,
      ),
    ),
  );
}

LearningPathData _populated() => const LearningPathData(
      skillStates: [
        LearningPathSkillStateModel(
          topic: 'Algebra',
          band: 'Developing',
          masteryLevel: 'beginner',
          coveragePercent: 42.0,
        ),
      ],
      weaknessRecords: [
        LearningPathWeaknessRecordModel(
          topic: 'Fractions',
          severity: 'high',
          recommendedFocus: 'Division of fractions',
        ),
      ],
      recommendations: [
        LearningPathRecommendationModel(
          topic: 'Algebra',
          action: 'Practice factoring',
          reason: 'Backend-identified weakness in factoring.',
        ),
      ],
    );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

void main() {
  group('LearningPathPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const LearningPathPage(),
          overrides: [
            learningPathProvider.overrideWith(
              (ref) => _FakeLearningPathNotifier(
                const AppAsyncState.loading(),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      // AIMFullScreenLoading renders; no exception thrown.
      expect(find.byType(LearningPathPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      const msg = 'Network error';
      await tester.pumpWidget(
        _wrap(
          const LearningPathPage(),
          overrides: [
            learningPathProvider.overrideWith(
              (ref) => _FakeLearningPathNotifier(
                const AppAsyncState.failure(message: msg),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text(msg), findsOneWidget);
    });

    testWidgets('shows empty state when LearningPathData is empty',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const LearningPathPage(),
          overrides: [
            learningPathProvider.overrideWith(
              (ref) => _FakeLearningPathNotifier(
                const AppAsyncState.success(
                  LearningPathData(
                    skillStates: [],
                    weaknessRecords: [],
                    recommendations: [],
                  ),
                ),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text('Your learning path is empty'), findsOneWidget);
    });

    testWidgets('shows all three sections when data is populated',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const LearningPathPage(),
          overrides: [
            learningPathProvider.overrideWith(
              (ref) => _FakeLearningPathNotifier(
                AppAsyncState.success(_populated()),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text('Skill States'), findsOneWidget);
      expect(find.text('Focus Areas'), findsOneWidget);
      expect(find.text('AIM Recommendations'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const LearningPathPage(),
          overrides: [
            learningPathProvider.overrideWith(
              (ref) => _FakeLearningPathNotifier(
                AppAsyncState.success(_populated()),
              ),
            ),
          ],
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();

      // No layout exceptions; page renders correctly.
      expect(find.byType(LearningPathPage), findsOneWidget);
      expect(find.text('Skill States'), findsOneWidget);
    });
  });
}

// ---------------------------------------------------------------------------
// Fake notifier
// ---------------------------------------------------------------------------

class _FakeLearningPathNotifier
    extends StateNotifier<AppAsyncState<LearningPathData>> {
  _FakeLearningPathNotifier(super.state);

  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {}

  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) async {}

  void clear() {}
}
