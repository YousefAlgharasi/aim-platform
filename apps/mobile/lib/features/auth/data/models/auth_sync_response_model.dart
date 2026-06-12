import 'current_user_model.dart';

class AuthSyncResponseModel {
  const AuthSyncResponseModel({
    required this.user,
    required this.created,
  });

  factory AuthSyncResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthSyncResponseModel(
      user: CurrentUserModel.fromJson(json['user'] as Map<String, dynamic>),
      created: json['created'] as bool? ?? false,
    );
  }

  final CurrentUserModel user;
  final bool created;
}
