// Phase 8 — P8-081
// Unit tests for AI Teacher chat data-layer models.
//
// Verifies that each model:
//   - Parses all contract fields from JSON correctly.
//   - Re-serialises to JSON without data loss.
//   - Does NOT compute, transform, or infer any backend-owned value
//     (status, role, rating, provider/model/latencyMs).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';

void main() {
  group('AiChatSessionModel', () {
    const json = {
      'sessionId': 'session-1',
      'studentId': 'student-1',
      'contextRef': 'lesson:fractions',
      'status': 'active',
      'createdAt': '2026-06-19T00:00:00.000Z',
    };

    test('parses all contract fields from JSON', () {
      final model = AiChatSessionModel.fromJson(json);
      expect(model.sessionId, 'session-1');
      expect(model.studentId, 'student-1');
      expect(model.contextRef, 'lesson:fractions');
      expect(model.status, 'active');
      expect(model.createdAt, '2026-06-19T00:00:00.000Z');
    });

    test('round-trips through toJson without data loss', () {
      final model = AiChatSessionModel.fromJson(json);
      expect(model.toJson(), json);
    });
  });

  group('AiChatSessionSummaryModel', () {
    const json = {
      'sessionId': 'session-1',
      'contextRef': 'lesson:fractions',
      'contextTitle': 'Fractions Basics',
      'status': 'active',
      'createdAt': '2026-06-19T00:00:00.000Z',
      'updatedAt': '2026-06-19T01:00:00.000Z',
    };

    test('parses all contract fields from JSON', () {
      final model = AiChatSessionSummaryModel.fromJson(json);
      expect(model.sessionId, 'session-1');
      expect(model.contextRef, 'lesson:fractions');
      expect(model.contextTitle, 'Fractions Basics');
      expect(model.status, 'active');
      expect(model.createdAt, '2026-06-19T00:00:00.000Z');
      expect(model.updatedAt, '2026-06-19T01:00:00.000Z');
    });

    test('round-trips through toJson without data loss', () {
      final model = AiChatSessionSummaryModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('listFromJson parses sessions array, empty when absent', () {
      final list = AiChatSessionSummaryModel.listFromJson({
        'sessions': [json],
      });
      expect(list, hasLength(1));
      expect(list.first.sessionId, 'session-1');

      final empty = AiChatSessionSummaryModel.listFromJson(const {});
      expect(empty, isEmpty);
    });
  });

  group('AiChatMessageModel', () {
    const json = {
      'id': 'message-1',
      'role': 'ai_teacher',
      'text': "Great question! Let's break it down.",
      'createdAt': '2026-06-19T00:00:00.000Z',
    };

    test('parses all contract fields from JSON', () {
      final model = AiChatMessageModel.fromJson(json);
      expect(model.id, 'message-1');
      expect(model.role, 'ai_teacher');
      expect(model.text, "Great question! Let's break it down.");
      expect(model.createdAt, '2026-06-19T00:00:00.000Z');
    });

    test('round-trips through toJson without data loss', () {
      final model = AiChatMessageModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('isFromStudent / isFromAiTeacher reflect role verbatim', () {
      final aiMessage = AiChatMessageModel.fromJson(json);
      expect(aiMessage.isFromAiTeacher, isTrue);
      expect(aiMessage.isFromStudent, isFalse);

      final studentMessage = AiChatMessageModel.fromJson({
        ...json,
        'role': 'student',
      });
      expect(studentMessage.isFromStudent, isTrue);
      expect(studentMessage.isFromAiTeacher, isFalse);
    });
  });

  group('AiChatHistoryModel', () {
    const json = {
      'sessionId': 'session-1',
      'messages': [
        {
          'id': 'message-1',
          'role': 'student',
          'text': 'hello',
          'createdAt': '2026-06-19T00:00:00.000Z',
        },
        {
          'id': 'message-2',
          'role': 'ai_teacher',
          'text': 'hi there',
          'createdAt': '2026-06-19T00:00:01.000Z',
        },
      ],
    };

    test('parses sessionId and messages in order', () {
      final model = AiChatHistoryModel.fromJson(json);
      expect(model.sessionId, 'session-1');
      expect(model.messages, hasLength(2));
      expect(model.messages[0].id, 'message-1');
      expect(model.messages[1].id, 'message-2');
    });

    test('round-trips through toJson without data loss', () {
      final model = AiChatHistoryModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('defaults to an empty message list when messages is absent', () {
      final model = AiChatHistoryModel.fromJson(const {'sessionId': 'session-1'});
      expect(model.messages, isEmpty);
    });
  });

  group('AiTeacherReplyModel', () {
    const json = {
      'text': "Great question! Let's break it down.",
      'isFallback': false,
      'provider': 'fake-provider',
      'model': 'fake-model',
      'latencyMs': 120,
    };

    test('parses all contract fields from JSON', () {
      final model = AiTeacherReplyModel.fromJson(json);
      expect(model.text, "Great question! Let's break it down.");
      expect(model.isFallback, isFalse);
      expect(model.provider, 'fake-provider');
      expect(model.model, 'fake-model');
      expect(model.latencyMs, 120);
    });

    test('round-trips through toJson without data loss', () {
      final model = AiTeacherReplyModel.fromJson(json);
      expect(model.toJson(), json);
    });
  });

  group('AiTeacherFeedbackModel', () {
    const json = {
      'feedbackId': 'feedback-1',
      'messageId': 'message-1',
      'rating': 'helpful',
      'createdAt': '2026-06-19T00:00:00.000Z',
    };

    test('parses all contract fields from JSON', () {
      final model = AiTeacherFeedbackModel.fromJson(json);
      expect(model.feedbackId, 'feedback-1');
      expect(model.messageId, 'message-1');
      expect(model.rating, 'helpful');
      expect(model.createdAt, '2026-06-19T00:00:00.000Z');
    });

    test('round-trips through toJson without data loss', () {
      final model = AiTeacherFeedbackModel.fromJson(json);
      expect(model.toJson(), json);
    });

    test('preserves rating value verbatim, never computes it', () {
      final model = AiTeacherFeedbackModel.fromJson({
        ...json,
        'rating': 'not_helpful',
      });
      expect(model.rating, 'not_helpful');
    });
  });
}
