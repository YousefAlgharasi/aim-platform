// The backend sends a notification as { id, channel, category, state,
// payload: { title, body }, read_at, ... }. The model must read that shape
// (it used to need top-level `status`/`title`/`body`, which the backend does
// not send, so admin broadcasts and reminders never showed in the app).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/notifications/data/models/notification_event_model.dart';

void main() {
  test('reads the backend row: title and body come from payload, status from state', () {
    final e = NotificationEventModel.fromJson({
      'id': 'e1',
      'recipient_id': 'u1',
      'template_id': 't1',
      'channel': 'in_app',
      'category': 'system_alert',
      'state': 'queued',
      'payload': {
        'title': 'Maintenance tonight',
        'body': 'The app will be down at 2am.',
        'broadcast_title': 'Maintenance tonight',
      },
      'read_at': null,
      'dismissed_at': null,
      'created_at': '2026-11-11T10:00:00Z',
    });
    expect(e.title, 'Maintenance tonight');
    expect(e.body, 'The app will be down at 2am.');
    expect(e.status, 'queued');
    expect(e.category, 'system_alert');
    expect(e.isUnread, isTrue);
  });

  test('read and dismissed rows are not unread', () {
    Map<String, dynamic> row(String state, {String? readAt}) => {
          'id': 'e',
          'channel': 'in_app',
          'category': 'system_alert',
          'state': state,
          'payload': {'title': 'x'},
          'read_at': readAt,
          'created_at': '2026-11-11T10:00:00Z',
        };
    expect(NotificationEventModel.fromJson(row('read')).isUnread, isFalse);
    expect(NotificationEventModel.fromJson(row('dismissed')).isUnread, isFalse);
    expect(NotificationEventModel.fromJson(row('sent', readAt: '2026-11-11T11:00:00Z')).isUnread, isFalse);
    expect(NotificationEventModel.fromJson(row('sent')).isUnread, isTrue);
  });

  test('the older flat shape and missing fields still parse', () {
    final e = NotificationEventModel.fromJson({
      'id': 'e2',
      'channel': 'in_app',
      'category': 'learning_reminder',
      'status': 'sent',
      'title': 'Time to review',
      'body': 'Two skills are due.',
      'created_at': '2026-11-11T10:00:00Z',
    });
    expect(e.title, 'Time to review');
    expect(e.body, 'Two skills are due.');

    final bare = NotificationEventModel.fromJson({'id': 'e3', 'created_at': '2026-11-11T10:00:00Z'});
    expect(bare.title, isNull);
    expect(bare.channel, 'in_app');
  });
}
