import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';

class ClientSafeRoleModel extends AuthRole {
  const ClientSafeRoleModel({
    super.id = '',
    required super.key,
    required super.name,
  });

  factory ClientSafeRoleModel.fromJson(Map<String, dynamic> json) {
    return ClientSafeRoleModel(
      key: json['key'] as String,
      name: json['name'] as String,
    );
  }

  factory ClientSafeRoleModel.fromKey(String key) {
    return ClientSafeRoleModel(
      key: key,
      name: _labelFromKey(key),
    );
  }
}

String _labelFromKey(String key) {
  return key
      .split('_')
      .where((part) => part.isNotEmpty)
      .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}
