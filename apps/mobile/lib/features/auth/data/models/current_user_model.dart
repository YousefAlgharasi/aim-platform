import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';

class CurrentUserModel extends AuthUser {
  const CurrentUserModel({
    required super.id,
    super.email,
    super.phone,
    super.userType,
    super.status,
  });

  // GET /auth/me only returns {id, email} — userType/status are sourced from
  // the DB and only present on the /auth/bootstrap response, not here.
  factory CurrentUserModel.fromJson(Map<String, dynamic> json) {
    return CurrentUserModel(
      id: json['id'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      userType: json['userType'] as String?,
      status: json['status'] as String?,
    );
  }

  bool get isActive => status == null || status == 'active';
}
