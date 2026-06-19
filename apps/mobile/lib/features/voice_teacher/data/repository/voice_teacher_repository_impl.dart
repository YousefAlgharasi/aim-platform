import 'dart:typed_data';

import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_teacher_remote_datasource.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_message_model.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_message.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_session.dart';
import 'package:aim_mobile/features/voice_teacher/logic/repository/voice_teacher_repository.dart';

class VoiceTeacherRepositoryImpl implements VoiceTeacherRepository {
  final VoiceTeacherRemoteDatasource _datasource;
  final String Function() _bearerTokenGetter;

  VoiceTeacherRepositoryImpl({
    required VoiceTeacherRemoteDatasource datasource,
    String Function()? bearerTokenGetter,
  })  : _datasource = datasource,
        _bearerTokenGetter = bearerTokenGetter ?? (() => '');

  @override
  Future<String> startSession({String? contextRef}) async {
    final response = await _datasource.startSession(
      bearerToken: _bearerTokenGetter(),
      contextRef: contextRef,
    );
    return response.sessionId;
  }

  @override
  Future<List<VoiceSession>> listSessions() async {
    final models = await _datasource.listSessions(
      bearerToken: _bearerTokenGetter(),
    );
    return models
        .map((m) => VoiceSession(
              sessionId: m.sessionId,
              createdAt: DateTime.parse(m.createdAt),
              messageCount: m.messageCount,
              contextRef: m.contextRef,
            ))
        .toList();
  }

  @override
  Future<List<VoiceMessage>> getSessionHistory(String sessionId) async {
    final models = await _datasource.getSessionHistory(
      bearerToken: _bearerTokenGetter(),
      sessionId: sessionId,
    );
    return models.map(_toEntity).toList();
  }

  @override
  Future<({VoiceMessage studentMessage, VoiceMessage teacherMessage, String? audioRef})>
      submitAudio({
    required String sessionId,
    required Uint8List audioBytes,
    required String mimeType,
  }) async {
    final response = await _datasource.submitAudio(
      bearerToken: _bearerTokenGetter(),
      sessionId: sessionId,
      audioBytes: audioBytes,
      mimeType: mimeType,
    );
    final now = DateTime.now();
    return (
      studentMessage: VoiceMessage(
        id: '${response.messageId}-student',
        role: VoiceMessageRole.student,
        text: response.transcript,
        timestamp: now,
      ),
      teacherMessage: VoiceMessage(
        id: response.messageId,
        role: VoiceMessageRole.teacher,
        text: response.aiResponseText,
        audioRef: response.audioRef,
        timestamp: now,
      ),
      audioRef: response.audioRef,
    );
  }

  @override
  Future<Uint8List> getAudioPlayback(String audioRef) {
    return _datasource.getAudioPlayback(
      bearerToken: _bearerTokenGetter(),
      audioRef: audioRef,
    );
  }

  @override
  Future<void> submitFeedback({
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) {
    return _datasource.submitFeedback(
      bearerToken: _bearerTokenGetter(),
      sessionId: sessionId,
      messageId: messageId,
      rating: rating,
      comment: comment,
    );
  }

  VoiceMessage _toEntity(VoiceMessageModel model) {
    return VoiceMessage(
      id: model.id,
      role: model.role == 'teacher'
          ? VoiceMessageRole.teacher
          : VoiceMessageRole.student,
      text: model.text,
      audioRef: model.audioRef,
      timestamp: DateTime.parse(model.timestamp),
    );
  }
}
