import '../../logic/entity/student_profile.dart';

class StudentProfileModel extends StudentProfile {
  const StudentProfileModel({
    required super.id,
    required super.profileType,
    super.displayName,
    super.avatarUrl,
    super.preferredLanguage,
    super.timezone,
  });

  factory StudentProfileModel.fromJson(Map<String, dynamic> json) {
    return StudentProfileModel(
      id: json['id'] as String,
      profileType: json['profileType'] as String? ?? 'student_profile',
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
      timezone: json['timezone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'profileType': profileType,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'preferredLanguage': preferredLanguage,
      'timezone': timezone,
    };
  }
}
