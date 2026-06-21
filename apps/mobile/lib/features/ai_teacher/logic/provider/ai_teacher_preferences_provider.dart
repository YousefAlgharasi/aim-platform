// Phase 18 — P18-067
// AI Teacher preferences provider — local-only settings.
//
// No backend AI Teacher preference/settings endpoint exists (see
// docs/phase-18/ai-teacher-api-contracts.md); the only safe, real "user
// controls" are device-local display preferences. This notifier never
// reads/writes mastery/level/weakness/difficulty/recommendation/
// review-schedule data and never calls an AI provider.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/ai_teacher/data/preferences/ai_teacher_preferences_store.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_preferences.dart';

final aiTeacherPreferencesStoreProvider =
    Provider<AiTeacherPreferencesStore>((ref) {
  return const AiTeacherPreferencesStore();
});

final aiTeacherPreferencesProvider = StateNotifierProvider<
    AiTeacherPreferencesNotifier, AiTeacherPreferences>((ref) {
  return AiTeacherPreferencesNotifier(
    store: ref.watch(aiTeacherPreferencesStoreProvider),
  );
});

class AiTeacherPreferencesNotifier extends StateNotifier<AiTeacherPreferences> {
  AiTeacherPreferencesNotifier({required AiTeacherPreferencesStore store})
      : _store = store,
        super(const AiTeacherPreferences()) {
    _load();
  }

  final AiTeacherPreferencesStore _store;

  Future<void> _load() async {
    final preferTextReplies = await _store.getPreferTextReplies();
    final reducedMotion = await _store.getReducedMotion();
    if (mounted) {
      state = AiTeacherPreferences(
        preferTextReplies: preferTextReplies,
        reducedMotion: reducedMotion,
      );
    }
  }

  Future<void> setPreferTextReplies(bool value) async {
    await _store.setPreferTextReplies(value);
    if (mounted) state = state.copyWith(preferTextReplies: value);
  }

  Future<void> setReducedMotion(bool value) async {
    await _store.setReducedMotion(value);
    if (mounted) state = state.copyWith(reducedMotion: value);
  }
}
