import '../../logic/entity/student_profile.dart';

class StudentProfileModel extends StudentProfile {
  const StudentProfileModel({
    required super.id,
    required super.userId,
    required super.profileType,
    super.displayName,
    super.avatarUrl,
    super.preferredLanguage,
    super.timezone,
    required super.createdAt,
    required super.updatedAt,
  });

  factory StudentProfileModel.fromJson(Map<String, dynamic> json) {
    return StudentProfileModel(
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

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'profileType': profileType,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'preferredLanguage': preferredLanguage,
      'timezone': timezone,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}
