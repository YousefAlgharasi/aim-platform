import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Local-only "has the student seen the first-time walkthrough" flag.
///
/// Purely a device-local UX preference — never sent to or read from the
/// backend, and never affects any learning/progress/mastery data.
class OnboardingWalkthroughStore {
  const OnboardingWalkthroughStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _keyHasSeenWalkthrough =
      'aim.onboarding.has_seen_walkthrough';

  final FlutterSecureStorage _storage;

  Future<bool> getHasSeenWalkthrough() async {
    final value = await _storage.read(key: _keyHasSeenWalkthrough);
    return value == 'true';
  }

  Future<void> setHasSeenWalkthrough(bool value) {
    return _storage.write(
      key: _keyHasSeenWalkthrough,
      value: value.toString(),
    );
  }
}
