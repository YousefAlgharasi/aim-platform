import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';

/// Result of a successful POST /auth/refresh call.
///
/// `expiresAt` is the Unix timestamp (in seconds) at which [accessToken]
/// expires, as returned by the backend.
class RefreshResult extends AuthRefreshResult {
  const RefreshResult({
    required super.accessToken,
    required super.refreshToken,
    required super.expiresAt,
  });

  factory RefreshResult.fromJson(Map<String, dynamic> json) {
    return RefreshResult(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresAt: json['expiresAt'] as int,
    );
  }
}
