class AdminProfile {
  const AdminProfile({
    required this.id,
    required this.userId,
    required this.profileType,
    this.displayName,
    this.avatarUrl,
    this.department,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? department;
  final String createdAt;
  final String updatedAt;

  bool get isAdminProfile => profileType == 'admin_profile';
}
