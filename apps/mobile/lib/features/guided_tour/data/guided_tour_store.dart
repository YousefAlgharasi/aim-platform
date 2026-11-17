import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Remembers which guided tours a student has finished or dismissed.
///
/// Same rule as the web app: one flag per user and per tour, kept only on the
/// device (there is no backend preference for it). It is a display preference
/// and never touches learning, progress or mastery data. Reads and writes are
/// guarded: when storage is unavailable nothing can be remembered, so the
/// caller never starts a tour by itself.
class GuidedTourStore {
  const GuidedTourStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static String key(String userId, String tourId) =>
      'aim.tour.v1.$userId.$tourId';

  /// Null when storage could not be read.
  Future<bool?> hasSeen(String userId, String tourId) async {
    try {
      return (await _storage.read(key: key(userId, tourId))) == 'true';
    } catch (_) {
      return null;
    }
  }

  /// Returns false when the flag could not be saved.
  Future<bool> markSeen(String userId, String tourId) async {
    try {
      await _storage.write(key: key(userId, tourId), value: 'true');
      return true;
    } catch (_) {
      return false;
    }
  }
}
