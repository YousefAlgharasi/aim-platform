import 'current_user_model.dart';

class AuthSyncResponseModel {
  const AuthSyncResponseModel({
    required this.user,
    required this.created,
  });

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

  final CurrentUserModel user;
  final bool created;
}
