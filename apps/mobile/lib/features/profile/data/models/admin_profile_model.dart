import '../../logic/entity/admin_profile.dart';

class AdminProfileModel extends AdminProfile {
  const AdminProfileModel({
    required super.id,
    required super.profileType,
    super.displayName,
    super.avatarUrl,
    super.department,
  });

  factory AdminProfileModel.fromJson(Map<String, dynamic> json) {
    return AdminProfileModel(
      id: json['id'] as String,
      profileType: json['profileType'] as String? ?? 'admin_profile',
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      department: json['department'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'profileType': profileType,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'department': department,
    };
  }
}
