class ClientSafeProfileModel {
  const ClientSafeProfileModel({
    required this.id,
    required this.userId,
    required this.profileType,
    this.displayName,
    this.avatarUrl,
    this.preferredLanguage,
    this.timezone,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ClientSafeProfileModel.fromJson(Map<String, dynamic> json) {
    return ClientSafeProfileModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      profileType: json['profileType'] as String,
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
      timezone: json['timezone'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  final String id;
  final String userId;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? preferredLanguage;
  final String? timezone;
  final String createdAt;
  final String updatedAt;
}
