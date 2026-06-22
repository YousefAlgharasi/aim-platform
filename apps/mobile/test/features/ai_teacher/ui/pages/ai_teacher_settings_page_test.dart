// Phase 18 — P18-068
// ai_teacher_settings_page_test.dart — widget tests for
// AiTeacherSettingsPage.
//
// Covers:
//   1. Both device-local preference switches render with their current
//      values.
//   2. Toggling a switch calls the notifier and never touches any backend
//      AI Teacher endpoint (no-authority: settings are local-only).
//   3. The info banner explaining the local-only scope is always shown.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/data/preferences/ai_teacher_preferences_store.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_preferences.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_preferences_provider.dart';
import 'package:aim_mobile/features/ai_teacher/ui/pages/ai_teacher_settings_page.dart';

Widget _wrap(Widget child, {List<Override> overrides = const []}) =>
    ProviderScope(
      overrides: overrides,
      child: MaterialApp(theme: AppTheme.light, home: child),
    );

void main() {
  group('AiTeacherSettingsPage', () {
    testWidgets('renders both preference switches with current values', (
      tester,
    ) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherSettingsPage(),
        overrides: [
          aiTeacherPreferencesProvider.overrideWith(
            (ref) => _FakeAiTeacherPreferencesNotifier(
              const AiTeacherPreferences(
                preferTextReplies: true,
                reducedMotion: false,
              ),
            ),
          ),
        ],
      ));
      await tester.pump();

      expect(find.text('Prefer text replies over voice'), findsOneWidget);
      expect(
        find.text('Reduce animations in AI Teacher and Voice Tutor'),
        findsOneWidget,
      );

      final switches =
          tester.widgetList<AIMSwitch>(find.byType(AIMSwitch)).toList();
      expect(switches.length, 2);
      expect(switches[0].value, true);
      expect(switches[1].value, false);
    });

    testWidgets('toggling a switch calls the notifier setter', (
      tester,
    ) async {
      final notifier = _FakeAiTeacherPreferencesNotifier(
        const AiTeacherPreferences(),
      );
      await tester.pumpWidget(_wrap(
        const AiTeacherSettingsPage(),
        overrides: [
          aiTeacherPreferencesProvider.overrideWith((ref) => notifier),
        ],
      ));
      await tester.pump();

      await tester.tap(find.byType(AIMSwitch).first);
      await tester.pump();

      expect(notifier.preferTextRepliesCalls, [true]);
      expect(notifier.reducedMotionCalls, isEmpty);
    });

    testWidgets('always shows the local-only-scope info banner', (
      tester,
    ) async {
      await tester.pumpWidget(_wrap(
        const AiTeacherSettingsPage(),
        overrides: [
          aiTeacherPreferencesProvider.overrideWith(
            (ref) => _FakeAiTeacherPreferencesNotifier(
              const AiTeacherPreferences(),
            ),
          ),
        ],
      ));
      await tester.pump();

      expect(find.text('About these settings'), findsOneWidget);
      expect(
        find.textContaining('never change how the AI Teacher is taught'),
        findsOneWidget,
      );

      for (final forbidden in [
        'mastery',
        'level',
        'weakness',
        'difficulty',
        'review-schedule',
      ]) {
        expect(find.textContaining(forbidden), findsNothing);
      }
    });
  });
}

class _NoopAiTeacherPreferencesStore extends AiTeacherPreferencesStore {
  const _NoopAiTeacherPreferencesStore(this.initialState);

  final AiTeacherPreferences initialState;

  @override
  Future<bool> getPreferTextReplies() async => initialState.preferTextReplies;

  @override
  Future<void> setPreferTextReplies(bool value) async {}

  @override
  Future<bool> getReducedMotion() async => initialState.reducedMotion;

  @override
  Future<void> setReducedMotion(bool value) async {}
}

class _FakeAiTeacherPreferencesNotifier extends AiTeacherPreferencesNotifier {
  _FakeAiTeacherPreferencesNotifier(AiTeacherPreferences initialState)
      : super(store: _NoopAiTeacherPreferencesStore(initialState)) {
    state = initialState;
  }

  final List<bool> preferTextRepliesCalls = [];
  final List<bool> reducedMotionCalls = [];

  @override
  Future<void> setPreferTextReplies(bool value) async {
    preferTextRepliesCalls.add(value);
    state = state.copyWith(preferTextReplies: value);
  }

  @override
  Future<void> setReducedMotion(bool value) async {
    reducedMotionCalls.add(value);
    state = state.copyWith(reducedMotion: value);
  }
}
