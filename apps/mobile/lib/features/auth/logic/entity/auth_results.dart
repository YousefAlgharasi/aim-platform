// Domain layer — pure Auth operation result entities.
//
// Completely independent of Flutter, networking, and JSON serialization.

import 'auth_context.dart';

class AuthLoginResult {
  const AuthLoginResult({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    this.userEmail = '',
    this.userId = '',
  });

  final String accessToken;
  final String refreshToken;
  final int expiresAt;
  final String userEmail;
  final String userId;
}

class AuthRefreshResult {
  const AuthRefreshResult({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  final String accessToken;
  final String refreshToken;
  final int expiresAt;
}

class AuthRegisterResult {
  const AuthRegisterResult({
    this.requiresEmailConfirmation = false,
    this.accessToken,
    this.refreshToken,
    this.expiresAt,
    this.userId,
    this.userEmail,
    this.user = const AuthUser(id: ''),
    this.message = '',
  });

  final bool requiresEmailConfirmation;
  final String? accessToken;
  final String? refreshToken;
  final int? expiresAt;
  final String? userId;
  final String? userEmail;
  final AuthUser user;
  final String message;
}

class AuthSyncResult {
  const AuthSyncResult({
    required this.user,
    required this.syncedAt,
  });

  final AuthUser user;
  final String syncedAt;
}
