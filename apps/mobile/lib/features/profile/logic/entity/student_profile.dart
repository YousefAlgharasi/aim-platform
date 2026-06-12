class StudentProfile {
  const StudentProfile({
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

  final String id;
  final String userId;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? preferredLanguage;
  final String? timezone;
  final String createdAt;
  final String updatedAt;

  bool get isStudentProfile => profileType == 'student_profile';
}
