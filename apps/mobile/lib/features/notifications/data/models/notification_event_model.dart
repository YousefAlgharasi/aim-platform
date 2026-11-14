// P13-053: Notification event model.
//
// Mirrors the backend's NotificationEventEntity. `title`/`body` are rendered
// server-side from approved templates — Flutter never renders raw AIM
// output, answers, or secrets here; it only displays what the backend sends.
/// An in-app route from a notification payload. Anything else (a full URL,
/// a protocol-relative path, odd characters) is ignored.
String? safeInternalLink(Object? value) {
  if (value is! String) return null;
  return RegExp(r'^/(?!/)[\w\-./?=&%]*$').hasMatch(value) ? value : null;
}

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
    this.link,
  });

  /// Reads a notification row as the backend sends it: the readable text lives
  /// in `payload` (`payload.title` / `payload.body`) and the lifecycle value
  /// is `state`. Top-level `title`, `body` and `status` are accepted too, so
  /// either shape shows the notification instead of failing to load it.
  factory NotificationEventModel.fromJson(Map<String, dynamic> json) {
    String? text(Object? v) {
      if (v is! String) return null;
      final t = v.trim();
      return t.isEmpty ? null : t;
    }

    final payload = json['payload'] is Map<String, dynamic>
        ? json['payload'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final status = text(json['status']) ?? text(json['state']) ?? 'sent';
    return NotificationEventModel(
      id: json['id'] as String,
      templateId: json['template_id'] as String?,
      channel: (json['channel'] as String?) ?? 'in_app',
      category: (json['category'] as String?) ?? 'system_alert',
      status: status,
      title: text(json['title']) ?? text(payload['title']),
      body: text(json['body']) ?? text(payload['body']),
      scheduledAt: json['scheduled_at'] as String?,
      sentAt: json['sent_at'] as String?,
      readAt: json['read_at'] as String?,
      dismissedAt: json['dismissed_at'] as String?,
      createdAt: (json['created_at'] as String?) ?? DateTime.now().toUtc().toIso8601String(),
      link: safeInternalLink(payload['link']),
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

  /// An in-app path from the payload (e.g. `/improve`), or null.
  final String? link;

  bool get isUnread =>
      readAt == null && dismissedAt == null && status != 'read' && status != 'dismissed';
}
