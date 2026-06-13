class ProfileStudentProfileResponseModel {
  const ProfileStudentProfileResponseModel({
    required this.id,
    required this.profileType,
    this.displayName,
    this.avatarUrl,
    this.preferredLanguage,
    this.timezone,
  });

  factory ProfileStudentProfileResponseModel.fromJson(
      Map<String, dynamic> json) {
    return ProfileStudentProfileResponseModel(
      id: json['id'] as String,
      profileType: json['profileType'] as String? ?? 'student_profile',
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
      timezone: json['timezone'] as String?,
    );
  }

  final String id;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? preferredLanguage;
  final String? timezone;
}

class ProfileAdminProfileResponseModel {
  const ProfileAdminProfileResponseModel({
    required this.id,
    required this.profileType,
    this.displayName,
    this.avatarUrl,
    this.department,
  });

  factory ProfileAdminProfileResponseModel.fromJson(
      Map<String, dynamic> json) {
    return ProfileAdminProfileResponseModel(
      id: json['id'] as String,
      profileType: json['profileType'] as String? ?? 'admin_profile',
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      department: json['department'] as String?,
    );
  }

  final String id;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? department;
}

class ProfileMeResponseModel {
  const ProfileMeResponseModel({
    required this.internalUserId,
    required this.userType,
    this.studentProfile,
    this.adminProfile,
  });

  factory ProfileMeResponseModel.fromJson(Map<String, dynamic> json) {
    final sp = json['studentProfile'];
    final ap = json['adminProfile'];

    return ProfileMeResponseModel(
      internalUserId: json['internalUserId'] as String,
      userType: json['userType'] as String,
      studentProfile: sp is Map<String, dynamic>
          ? ProfileStudentProfileResponseModel.fromJson(sp)
          : null,
      adminProfile: ap is Map<String, dynamic>
          ? ProfileAdminProfileResponseModel.fromJson(ap)
          : null,
    );
  }

  final String internalUserId;
  final String userType;
  final ProfileStudentProfileResponseModel? studentProfile;
  final ProfileAdminProfileResponseModel? adminProfile;
}
