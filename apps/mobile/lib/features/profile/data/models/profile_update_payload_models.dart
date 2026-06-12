import '../../logic/entity/profile_update_payloads.dart';

class SafeStudentProfileUpdatePayloadModel
    extends SafeStudentProfileUpdatePayload {
  const SafeStudentProfileUpdatePayloadModel({
    super.displayName,
    super.avatarUrl,
    super.preferredLanguage,
    super.timezone,
  });

  factory SafeStudentProfileUpdatePayloadModel.fromEntity(
    SafeStudentProfileUpdatePayload payload,
  ) {
    return SafeStudentProfileUpdatePayloadModel(
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl,
      preferredLanguage: payload.preferredLanguage,
      timezone: payload.timezone,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (displayName != null) 'displayName': displayName,
      if (avatarUrl != null) 'avatarUrl': avatarUrl,
      if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
      if (timezone != null) 'timezone': timezone,
    };
  }
}

class SafeAdminProfileUpdatePayloadModel extends SafeAdminProfileUpdatePayload {
  const SafeAdminProfileUpdatePayloadModel({
    super.displayName,
    super.avatarUrl,
    super.department,
  });

  factory SafeAdminProfileUpdatePayloadModel.fromEntity(
    SafeAdminProfileUpdatePayload payload,
  ) {
    return SafeAdminProfileUpdatePayloadModel(
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl,
      department: payload.department,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (displayName != null) 'displayName': displayName,
      if (avatarUrl != null) 'avatarUrl': avatarUrl,
      if (department != null) 'department': department,
    };
  }
}
