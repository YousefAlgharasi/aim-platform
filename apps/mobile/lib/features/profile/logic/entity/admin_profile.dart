class AdminProfile {
  const AdminProfile({
    required this.id,
    required this.profileType,
    this.displayName,
    this.avatarUrl,
    this.department,
  });

  final String id;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? department;

  bool get isAdminProfile => profileType == 'admin_profile';
}
