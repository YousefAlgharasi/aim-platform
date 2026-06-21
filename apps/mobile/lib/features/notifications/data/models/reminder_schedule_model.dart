// P13-053: Reminder schedule model.
//
// The backend computes/owns the authoritative cron schedule and next-run
// time. Flutter only displays it and requests pause/resume/cancel.
class ReminderScheduleModel {
  const ReminderScheduleModel({
    required this.id,
    required this.reminderType,
    required this.status,
    required this.cronExpression,
  });

  factory ReminderScheduleModel.fromJson(Map<String, dynamic> json) {
    return ReminderScheduleModel(
      id: json['id'] as String,
      reminderType: json['reminder_type'] as String,
      status: json['status'] as String,
      cronExpression: json['cron_expression'] as String?,
    );
  }

  final String id;
  final String reminderType;
  final String status;
  final String? cronExpression;
}
