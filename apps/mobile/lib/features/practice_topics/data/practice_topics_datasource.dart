// Practice API calls (student side). The backend checks course access (402 without it).

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

import 'practice_topics_models.dart';

class PracticeTopicsDatasource {
  const PracticeTopicsDatasource({required BackendApiClient apiClient}) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  Future<List<PracticeTopic>> getTopics(String kind) async {
    final envelope = await _apiClient.get<List<PracticeTopic>>(
      BackendApiPaths.practiceTopics,
      queryParameters: {'kind': kind},
      decodeData: (json) =>
          (json as List<dynamic>).map((t) => PracticeTopic.fromJson(t as Map<String, dynamic>)).toList(),
    );
    return envelope.data ?? const [];
  }

  Future<PracticeSpeakingStart> startSpeaking(String topicId) async {
    final envelope = await _apiClient.post<PracticeSpeakingStart>(
      BackendApiPaths.practiceSpeakingStart,
      body: {'topicId': topicId},
      decodeData: (json) => PracticeSpeakingStart.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  /// Returns the XP awarded for the finished speaking attempt.
  Future<int> completeSpeaking(String attemptId) async {
    final envelope = await _apiClient.post<int>(
      BackendApiPaths.practiceSpeakingComplete(attemptId),
      body: const <String, dynamic>{},
      decodeData: (json) => ((json as Map<String, dynamic>)['xpAwarded'] as num?)?.toInt() ?? 0,
    );
    return envelope.data ?? 0;
  }

  Future<WritingResult> submitWriting(String topicId, String text) async {
    final envelope = await _apiClient.post<WritingResult>(
      BackendApiPaths.practiceWritingSubmit,
      body: {'topicId': topicId, 'text': text},
      decodeData: (json) => WritingResult.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }
}
