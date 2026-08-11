import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';

class ClientSafeProfileModel extends AuthProfile {
  const ClientSafeProfileModel({
    required super.id,
    this.userId,
    super.profileType,
    super.displayName,
    this.avatarUrl,
    super.preferredLanguage,
    super.timezone,
    this.createdAt,
    this.updatedAt,
  });

  factory ClientSafeProfileModel.fromJson(Map<String, dynamic> json) {
    return ClientSafeProfileModel(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      profileType: json['profileType'] as String?,
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
      timezone: json['timezone'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  final String? userId;
  final String? avatarUrl;
  final String? createdAt;
  final String? updatedAt;
}
