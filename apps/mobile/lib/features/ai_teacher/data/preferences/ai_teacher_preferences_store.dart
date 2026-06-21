import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Local-only AI Teacher preferences (P18-067).
///
/// These are display/interaction preferences the student controls on their
/// own device. They never reach the backend and never affect mastery/level/
/// weakness/difficulty/recommendation/review-schedule data — the AIM Engine
/// and AI Teacher backend remain the sole authority for learning state.
class AiTeacherPreferencesStore {
  const AiTeacherPreferencesStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _keyPreferTextReplies =
      'aim.ai_teacher.prefer_text_replies';
  static const String _keyReducedMotion = 'aim.ai_teacher.reduced_motion';

  final FlutterSecureStorage _storage;

  Future<bool> getPreferTextReplies() async {
    final value = await _storage.read(key: _keyPreferTextReplies);
    return value == 'true';
  }

  Future<void> setPreferTextReplies(bool value) {
    return _storage.write(key: _keyPreferTextReplies, value: value.toString());
  }

  Future<bool> getReducedMotion() async {
    final value = await _storage.read(key: _keyReducedMotion);
    return value == 'true';
  }

  Future<void> setReducedMotion(bool value) {
    return _storage.write(key: _keyReducedMotion, value: value.toString());
  }
}
