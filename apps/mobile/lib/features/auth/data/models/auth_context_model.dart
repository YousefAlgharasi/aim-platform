import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'client_safe_profile_model.dart';
import 'client_safe_role_model.dart';
import 'current_user_model.dart';

class AuthContextModel extends AuthContext {
  const AuthContextModel({
    required super.user,
    super.profile,
    required super.roles,
    required super.permissions,
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
