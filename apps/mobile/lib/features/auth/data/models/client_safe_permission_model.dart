import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';

class ClientSafePermissionModel extends AuthPermission {
  const ClientSafePermissionModel._() : super(id: '', key: '');

  factory ClientSafePermissionModel.fromJson(Map<String, dynamic> _) {
    return const ClientSafePermissionModel._();
  }
}

