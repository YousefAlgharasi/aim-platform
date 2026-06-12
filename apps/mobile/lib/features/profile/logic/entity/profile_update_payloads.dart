class SafeStudentProfileUpdatePayload {
  const SafeStudentProfileUpdatePayload({
    this.displayName,
    this.avatarUrl,
    this.preferredLanguage,
    this.timezone,
  });

  final String? displayName;
  final String? avatarUrl;
  final String? preferredLanguage;
  final String? timezone;
}

class SafeAdminProfileUpdatePayload {
  const SafeAdminProfileUpdatePayload({
    this.displayName,
    this.avatarUrl,
    this.department,
  });

  final String? displayName;
  final String? avatarUrl;
  final String? department;
}
