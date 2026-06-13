import 'client_safe_permission_model.dart';
import 'client_safe_profile_model.dart';
import 'client_safe_role_model.dart';
import 'current_user_model.dart';

class AuthContextModel {
  const AuthContextModel({
    required this.user,
    this.profile,
    required this.roles,
    required this.permissions,
  });

  factory AuthContextModel.fromJson(Map<String, dynamic> json) {
    final rawProfile = json['profile'];

    return AuthContextModel(
      user: CurrentUserModel.fromJson(json['user'] as Map<String, dynamic>),
      profile: rawProfile is Map<String, dynamic>
          ? ClientSafeProfileModel.fromJson(rawProfile)
          : null,
      roles: _parseRoles(json['roles']),
      permissions: const [],
    );
  }

  final CurrentUserModel user;
  final ClientSafeProfileModel? profile;
  final List<ClientSafeRoleModel> roles;
  final List<ClientSafePermissionModel> permissions;

  bool hasRole(String roleKey) => roles.any((r) => r.key == roleKey);

  bool hasPermission(String _) => false;
}

List<ClientSafeRoleModel> _parseRoles(Object? rawRoles) {
  if (rawRoles is! List<dynamic>) {
    return const [];
  }

  return rawRoles
      .map((role) {
        if (role is String) {
          return ClientSafeRoleModel.fromKey(role);
        }

        if (role is Map<String, dynamic>) {
          return ClientSafeRoleModel.fromJson(role);
        }

        return null;
      })
      .whereType<ClientSafeRoleModel>()
      .toList();
}
