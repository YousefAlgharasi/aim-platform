// Domain layer — pure Auth entities.
//
// Completely independent of Flutter, networking, and JSON serialization.

class AuthUser {
  const AuthUser({
    required this.id,
    this.email,
    this.phone,
    this.userType,
    this.status,
    this.emailConfirmed = false,
    this.isAnonymous = false,
  });

  final String id;
  final String? email;
  final String? phone;
  final String? userType;
  final String? status;
  final bool emailConfirmed;
  final bool isAnonymous;
}

class AuthProfile {
  const AuthProfile({
    required this.id,
    this.displayName,
    this.preferredLanguage,
    this.timezone,
    this.profileType,
  });

  final String id;
  final String? displayName;
  final String? preferredLanguage;
  final String? timezone;
  final String? profileType;
}

class AuthRole {
  const AuthRole({
    required this.id,
    required this.key,
    required this.name,
  });

  final String id;
  final String key;
  final String name;
}

class AuthPermission {
  const AuthPermission({
    required this.id,
    required this.key,
  });

  final String id;
  final String key;
}

class AuthContext {
  const AuthContext({
    required this.user,
    this.profile,
    required this.roles,
    required this.permissions,
  });

  final AuthUser user;
  final AuthProfile? profile;
  final List<AuthRole> roles;
  final List<AuthPermission> permissions;

  bool hasRole(String roleKey) => roles.any((r) => r.key == roleKey);

  bool hasPermission(String _) => false;
}
