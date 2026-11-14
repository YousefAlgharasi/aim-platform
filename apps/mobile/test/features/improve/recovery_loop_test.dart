import 'package:aim_mobile/features/improve/ui/improve_page.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/notifications/data/models/notification_event_model.dart';
import 'package:flutter_test/flutter_test.dart';

RecoverySkill _skill(Map<String, dynamic> over) => RecoverySkill.fromJson({
      'skillKey': 'en.a2.gra.comparatives',
      'title': 'Comparatives',
      'group': 'grammar',
      'openMistakes': 2,
      'unlocked': true,
      ...over,
    });

void main() {
  group('RecoverySkill', () {
    test('reads the server fields and falls back to vocabulary for an unknown group', () {
      expect(_skill({}).group, 'grammar');
      expect(_skill({'group': 'nonsense'}).group, 'vocabulary');
      expect(_skill({'masteryScore': 0.25}).masteryScore, 0.25);
    });

    test('counts whole days left, never below one while locked', () {
      final now = DateTime.utc(2026, 11, 13);
      expect(_skill({'unlocked': false, 'retryAvailableAt': '2026-11-15T12:00:00Z'}).daysLeft(now), 3);
      expect(_skill({'unlocked': false, 'retryAvailableAt': '2026-11-13T01:00:00Z'}).daysLeft(now), 1);
      expect(_skill({}).daysLeft(now), 0);
    });
  });

  group('recoveryGroupOf', () {
    test('prefers the server mapping, so pronunciation sits under speaking', () {
      final map = {'en.a1.pho.basic_blends': _skill({'skillKey': 'en.a1.pho.basic_blends', 'group': 'speaking'})};
      expect(recoveryGroupOf('en.a1.pho.basic_blends', map), 'speaking');
    });

    test('falls back to the key segments when the server mapping is missing', () {
      expect(recoveryGroupOf('en.a2.gra.comparatives', const {}), 'grammar');
      expect(recoveryGroupOf('placement.listening.dialogue', const {}), 'listening');
      expect(recoveryGroupOf('en.a1.pho.short_vowels', const {}), 'speaking');
      expect(recoveryGroupOf('something.unknown', const {}), 'vocabulary');
    });
  });

  group('safeInternalLink', () {
    test('allows in-app paths only', () {
      expect(safeInternalLink('/improve'), '/improve');
      expect(safeInternalLink('/improve/retry?skill=en.a1.gra.articles_a_an'), '/improve/retry?skill=en.a1.gra.articles_a_an');
      for (final bad in ['https://evil.com', '//evil.com', 'javascript:alert(1)', '', null, 5, '/a b', '/x"onclick=']) {
        expect(safeInternalLink(bad), isNull, reason: '$bad');
      }
    });

    test('the notification model carries a safe payload link', () {
      final e = NotificationEventModel.fromJson({
        'id': 'n1',
        'category': 'learning_reminder',
        'payload': {'title': 'Your Grammar retry is ready', 'body': 'b', 'link': '/improve'},
      });
      expect(e.link, '/improve');
      final bad = NotificationEventModel.fromJson({
        'id': 'n2',
        'payload': {'title': 't', 'link': 'https://evil.com'},
      });
      expect(bad.link, isNull);
    });
  });
}
