// P13-053: Notification event model.
//
// Mirrors the backend's NotificationEventEntity. `title`/`body` are rendered
// server-side from approved templates — Flutter never renders raw AIM
// output, answers, or secrets here; it only displays what the backend sends.
class NotificationEventModel {
  const NotificationEventModel({
    required this.id,
    required this.templateId,
    required this.channel,
    required this.category,
    required this.status,
    required this.title,
    required this.body,
    required this.scheduledAt,
    required this.sentAt,
    required this.readAt,
    required this.dismissedAt,
    required this.createdAt,
  });

  factory NotificationEventModel.fromJson(Map<String, dynamic> json) {
    return NotificationEventModel(
      id: json['id'] as String,
      templateId: json['template_id'] as String?,
      channel: json['channel'] as String,
      category: json['category'] as String,
      status: json['status'] as String,
      title: json['title'] as String?,
      body: json['body'] as String?,
      scheduledAt: json['scheduled_at'] as String?,
      sentAt: json['sent_at'] as String?,
      readAt: json['read_at'] as String?,
      dismissedAt: json['dismissed_at'] as String?,
      createdAt: json['created_at'] as String,
    );
  }

  final String id;
  final String? templateId;
  final String channel;
  final String category;
  final String status;
  final String? title;
  final String? body;
  final String? scheduledAt;
  final String? sentAt;
  final String? readAt;
  final String? dismissedAt;
  final String createdAt;

  bool get isUnread => readAt == null && dismissedAt == null;
}
