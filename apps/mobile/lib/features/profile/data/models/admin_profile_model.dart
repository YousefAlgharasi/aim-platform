import '../../logic/entity/admin_profile.dart';

class AdminProfileModel extends AdminProfile {
  const AdminProfileModel({
    required super.id,
    required super.userId,
    required super.profileType,
    super.displayName,
    super.avatarUrl,
    super.department,
    required super.createdAt,
    required super.updatedAt,
  });

  factory AdminProfileModel.fromJson(Map<String, dynamic> json) {
    return AdminProfileModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      profileType: json['profileType'] as String,
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      department: json['department'] as String?,
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
      'department': department,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}
