import '../../logic/entity/voice_message.dart';
import '../../logic/entity/voice_session.dart';
import '../../logic/repository/voice_teacher_repository.dart';
import '../datasources/voice_teacher_remote_datasource.dart';

class VoiceTeacherRepositoryImpl implements VoiceTeacherRepository {
  final VoiceTeacherRemoteDatasource _remoteDatasource;

  const VoiceTeacherRepositoryImpl(this._remoteDatasource);

  @override
  Future<String> startSession({String? contextRef}) {
    return _remoteDatasource.startSession(contextRef: contextRef);
  }

  @override
  Future<List<VoiceSession>> listSessions() async {
    final models = await _remoteDatasource.listSessions();
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<List<VoiceMessage>> getSessionHistory(String sessionId) async {
    final models = await _remoteDatasource.getSessionHistory(sessionId);
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<VoiceMessage> submitAudio(String sessionId, List<int> audioBytes, String mimeType) async {
    final model = await _remoteDatasource.submitAudio(sessionId, audioBytes, mimeType);
    return model.toEntity();
  }

  @override
  Future<List<int>> getAudioPlayback(String audioRef) {
    return _remoteDatasource.getAudioPlayback(audioRef);
  }

  @override
  Future<void> submitFeedback({
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) {
    return _remoteDatasource.submitFeedback(
      sessionId: sessionId,
      messageId: messageId,
      rating: rating,
      comment: comment,
    );
  }
}
