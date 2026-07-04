import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/voice_teacher/data/models/voice_session_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_message_model.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_message.dart';

void main() {
  group('VoiceSessionModel', () {
    test('fromJson parses all fields', () {
      final model = VoiceSessionModel.fromJson({
        'sessionId': 's-1',
        'createdAt': '2026-01-01T00:00:00Z',
        'messageCount': 5,
        'lastActivityAt': '2026-01-02T00:00:00Z',
      });

      expect(model.sessionId, 's-1');
      expect(model.createdAt, '2026-01-01T00:00:00Z');
      expect(model.messageCount, 5);
      expect(model.lastActivityAt, '2026-01-02T00:00:00Z');
    });

    test('fromJson defaults messageCount to 0', () {
      final model = VoiceSessionModel.fromJson({
        'sessionId': 's-2',
        'createdAt': '2026-01-01T00:00:00Z',
      });

      expect(model.messageCount, 0);
      expect(model.lastActivityAt, isNull);
    });
  });

  group('VoiceMessageModel', () {
    test('fromJson parses all fields', () {
      final model = VoiceMessageModel.fromJson({
        'id': 'm-1',
        'role': 'teacher',
        'text': 'Hello',
        'audioRef': 'audio:abc',
        'createdAt': '2026-01-01T00:00:00Z',
      });

      expect(model.id, 'm-1');
      expect(model.role, 'teacher');
      expect(model.text, 'Hello');
      expect(model.audioRef, 'audio:abc');
      expect(model.createdAt, '2026-01-01T00:00:00Z');
    });

    test('toEntity maps teacher role', () {
      final entity = VoiceMessageModel.fromJson({
        'id': 'm-1',
        'role': 'teacher',
        'text': 'Hi',
        'createdAt': '2026-01-01T00:00:00Z',
      }).toEntity();

      expect(entity.role, VoiceMessageRole.teacher);
      expect(entity.audioRef, isNull);
    });

    test('toEntity maps student role', () {
      final entity = VoiceMessageModel.fromJson({
        'id': 'm-2',
        'role': 'student',
        'text': 'Question',
        'createdAt': '2026-06-01T12:00:00Z',
      }).toEntity();

      expect(entity.role, VoiceMessageRole.student);
      expect(entity.createdAt, '2026-06-01T12:00:00Z');
    });

    // P21-015: unified text+voice conversation turn fields.
    test('fromJson parses channel/audioDurationMs/isGreeting', () {
      final model = VoiceMessageModel.fromJson({
        'id': 'm-3',
        'role': 'teacher',
        'text': 'Welcome!',
        'audioRef': 'audio:greeting',
        'audioDurationMs': 1500,
        'channel': 'voice',
        'isGreeting': true,
        'createdAt': '2026-01-01T00:00:00Z',
      });

      expect(model.channel, 'voice');
      expect(model.audioDurationMs, 1500);
      expect(model.isGreeting, true);
    });

    test('fromJson defaults channel to text and isGreeting to false', () {
      final model = VoiceMessageModel.fromJson({
        'id': 'm-4',
        'role': 'student',
        'text': 'hi',
        'createdAt': '2026-01-01T00:00:00Z',
      });

      expect(model.channel, 'text');
      expect(model.audioDurationMs, isNull);
      expect(model.isGreeting, false);
    });

    test('toEntity carries channel/audioDurationMs/isGreeting through, and hasAudio reflects audioRef', () {
      final entity = VoiceMessageModel.fromJson({
        'id': 'm-5',
        'role': 'teacher',
        'text': 'Welcome!',
        'audioRef': 'audio:greeting',
        'audioDurationMs': 1500,
        'channel': 'text',
        'isGreeting': true,
        'createdAt': '2026-01-01T00:00:00Z',
      }).toEntity();

      expect(entity.channel, 'text');
      expect(entity.audioDurationMs, 1500);
      expect(entity.isGreeting, true);
      expect(entity.hasAudio, true);
    });
  });
}
