/// Result of a successful POST /auth/refresh call.
///
/// `expiresAt` is the Unix timestamp (in seconds) at which [accessToken]
/// expires, as returned by the backend.
class RefreshResult {
  const RefreshResult({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  factory RefreshResult.fromJson(Map<String, dynamic> json) {
    return RefreshResult(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresAt: json['expiresAt'] as int,
    );
  }

  final String accessToken;
  final String refreshToken;

  /// Unix timestamp (seconds) at which [accessToken] expires.
  final int expiresAt;
}
