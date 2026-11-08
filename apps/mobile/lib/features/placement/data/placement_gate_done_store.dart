import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Device-local memo that the backend has already said the first-login
/// placement gate no longer applies to a student.
///
/// Once `/placement/decision` answers "do not show the gate" it never comes
/// back for that student, so remembering it per user lets later launches skip
/// the (slow-network) check entirely. This only avoids a repeat request; the
/// backend stays the sole authority and nothing learning-related is stored.
class PlacementGateDoneStore {
  const PlacementGateDoneStore();

  static const String _prefix = 'aim.placement.gate_done.';

  /// The user id (`sub`) inside [bearerToken], or null when it can't be read.
  static String? userIdOf(String bearerToken) {
    final parts = bearerToken.split('.');
    if (parts.length != 3) return null;
    try {
      final payload = jsonDecode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
      );
      final sub = payload is Map ? payload['sub'] : null;
      return sub is String && sub.isNotEmpty ? sub : null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> isDone(String bearerToken) async {
    final userId = userIdOf(bearerToken);
    if (userId == null) return false;
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool('$_prefix$userId') ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<void> markDone(String bearerToken) async {
    final userId = userIdOf(bearerToken);
    if (userId == null) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('$_prefix$userId', true);
    } catch (_) {
      // Best effort: worst case the next launch asks the backend again.
    }
  }
}
