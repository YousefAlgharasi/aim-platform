class UserProfile {
  const UserProfile({
    required this.id,
    this.email,
    this.phone,
    required this.userType,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String? email;
  final String? phone;
  final String userType;
  final String status;
  final String createdAt;
  final String updatedAt;

  bool get isActive => status == 'active';
}
