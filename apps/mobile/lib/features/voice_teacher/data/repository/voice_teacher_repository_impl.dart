import '../../logic/entity/voice_feedback_result.dart';
import '../../logic/entity/voice_message.dart';
import '../../logic/entity/voice_session.dart';
import '../../logic/entity/voice_turn_result.dart';
import '../../logic/repository/voice_teacher_repository.dart';
import '../datasources/voice_teacher_remote_datasource.dart';

class VoiceTeacherRepositoryImpl implements VoiceTeacherRepository {
  const VoiceTeacherRepositoryImpl({required this.datasource});

  final VoiceTeacherRemoteDatasource datasource;

  @override
  Future<String> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    final model = await datasource.startSession(
      bearerToken: bearerToken,
      contextRef: contextRef,
    );
    return model.sessionId;
  }

  @override
  Future<List<VoiceSession>> listSessions({required String bearerToken}) async {
    final models = await datasource.listSessions(bearerToken: bearerToken);
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<List<VoiceMessage>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    final models = await datasource.getSessionHistory(
      bearerToken: bearerToken,
      sessionId: sessionId,
    );
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<VoiceTurnResult> submitAudio({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  }) async {
    final model = await datasource.submitAudio(
      bearerToken: bearerToken,
      sessionId: sessionId,
      audioBytes: audioBytes,
      mimeType: mimeType,
    );
    return model.toEntity();
  }

  @override
  Future<List<int>> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  }) {
    return datasource.getAudioPlayback(
      bearerToken: bearerToken,
      audioRef: audioRef,
    );
  }

  @override
  Future<VoiceFeedbackResult> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) async {
    final model = await datasource.submitFeedback(
      bearerToken: bearerToken,
      sessionId: sessionId,
      messageId: messageId,
      rating: rating,
      comment: comment,
    );
    return model.toEntity();
  }
}
