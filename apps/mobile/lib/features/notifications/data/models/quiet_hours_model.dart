// P13-053: Quiet hours model.
//
// The backend is the final authority on whether quiet hours suppress a
// notification. Flutter only displays/edits the user's stored preference.
class QuietHoursModel {
  const QuietHoursModel({
    required this.enabled,
    required this.startTime,
    required this.endTime,
    required this.timezone,
  });

  factory QuietHoursModel.fromJson(Map<String, dynamic> json) {
    return QuietHoursModel(
      enabled: json['enabled'] as bool,
      startTime: json['start_time'] as String?,
      endTime: json['end_time'] as String?,
      timezone: json['timezone'] as String?,
    );
  }

  final bool enabled;
  final String? startTime;
  final String? endTime;
  final String? timezone;
}
