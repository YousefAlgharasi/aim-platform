class StudentProfile {
  const StudentProfile({
    required this.id,
    required this.profileType,
    this.displayName,
    this.avatarUrl,
    this.preferredLanguage,
    this.timezone,
  });

  final String id;
  final String profileType;
  final String? displayName;
  final String? avatarUrl;
  final String? preferredLanguage;
  final String? timezone;

  bool get isStudentProfile => profileType == 'student_profile';
}
