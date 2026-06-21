// P13-053: Notification preference model.
class NotificationPreferenceModel {
  const NotificationPreferenceModel({
    required this.id,
    required this.channel,
    required this.category,
    required this.enabled,
  });

  factory NotificationPreferenceModel.fromJson(Map<String, dynamic> json) {
    return NotificationPreferenceModel(
      id: json['id'] as String,
      channel: json['channel'] as String,
      category: json['category'] as String,
      enabled: json['enabled'] as bool,
    );
  }

  final String id;
  final String channel;
  final String category;
  final bool enabled;
}
