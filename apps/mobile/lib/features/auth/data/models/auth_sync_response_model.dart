import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'current_user_model.dart';

class AuthSyncResponseModel extends AuthSyncResult {
  const AuthSyncResponseModel({
    required CurrentUserModel super.user,
    required this.created,
  }) : super(syncedAt: '');

  factory AuthSyncResponseModel.fromJson(Map<String, dynamic> json) {
    final rawUser = json['user'];

    return AuthSyncResponseModel(
      user: rawUser is Map<String, dynamic>
          ? CurrentUserModel.fromJson(rawUser)
          : CurrentUserModel(
              id: json['internalUserId'] as String,
              email: null,
              userType: json['userType'] as String,
              status: json['status'] as String,
            ),
      created:
          json['created'] as bool? ?? json['userCreated'] as bool? ?? false,
    );
  }

  final bool created;
}
