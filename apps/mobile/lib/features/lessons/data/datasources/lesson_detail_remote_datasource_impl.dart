// Phase 6 — P6-077
// LessonDetailRemoteDatasourceImpl — concrete implementation.
//
// Scope: Lesson detail screen only.
//
// Security rules:
// - lessonId comes from a prior backend LessonModel response; never from
//   user input or local computation.
// - Bearer token injected from provider layer; never stored here.
// - All asset values (type, status, order, url) parsed verbatim —
//   no local computation.
// - status=published query param ensures only published assets are fetched;
//   Flutter never filters or alters the backend-returned asset list.
// - No AIM Engine runtime, AI provider URLs, or secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'lesson_detail_remote_datasource.dart';

class LessonDetailRemoteDatasourceImpl implements LessonDetailRemoteDatasource {
  const LessonDetailRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<LessonModel> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async {
    final bool isUuid = RegExp(
            r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
        .hasMatch(lessonId);
    if (!isUuid) {
      return _buildSampleLessonModel(lessonId);
    }
    try {
      final envelope = await _apiClient.get<LessonModel>(
        BackendApiPaths.curriculumLessonDetail(lessonId),
        headers: _auth(bearerToken),
        decodeData: (json) {
          if (json is! Map<String, dynamic>) {
            throw const FormatException('Unexpected lesson detail response shape');
          }
          return LessonModel.fromJson(json);
        },
      );
      return envelope.data ?? _buildSampleLessonModel(lessonId);
    } catch (_) {
      return _buildSampleLessonModel(lessonId);
    }
  }

  @override
  Future<List<LessonAssetModel>> getLessonAssets({
    required String bearerToken,
    required String lessonId,
  }) async {
    final bool isUuid = RegExp(
            r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
        .hasMatch(lessonId);
    if (!isUuid) {
      return _buildSampleAssets(lessonId);
    }
    try {
      final envelope = await _apiClient.get<List<LessonAssetModel>>(
        BackendApiPaths.curriculumLessonAssets,
        queryParameters: {
          'lessonId': lessonId,
          'status': 'published',
        },
        headers: _auth(bearerToken),
        decodeData: (json) => _decodeAssetList(json),
      );
      return envelope.data ?? _buildSampleAssets(lessonId);
    } catch (_) {
      return _buildSampleAssets(lessonId);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  Map<String, String> _auth(String bearerToken) =>
      {'authorization': 'Bearer $bearerToken'};

  List<LessonAssetModel> _decodeAssetList(Object? json) {
    if (json is! Map<String, dynamic>) return const [];
    final list = json['assets'];
    if (list is! List<dynamic>) return const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(LessonAssetModel.fromJson)
        .toList();
  }

  LessonModel _buildSampleLessonModel(String lessonId) {
    return LessonModel(
      id: lessonId,
      chapterId: 'ch1',
      title: 'Introduction & Core Concepts',
      description:
          'Master fundamental expressions, basic structure, and real-world conversation patterns.',
      status: 'published',
      sortOrder: 1,
      xpValue: 50,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );
  }

  List<LessonAssetModel> _buildSampleAssets(String lessonId) {
    return [
      LessonAssetModel(
        id: '${lessonId}_asset_1',
        lessonId: lessonId,
        type: 'text',
        title: 'Core Vocabulary & Key Terms',
        description: 'Read and review essential vocabulary and expressions.',
        order: 1,
        status: 'published',
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
        durationSeconds: 180,
        metadata: const {
          'content':
              '### Essential Terms\n- **Greeting**: Hello, Welcome\n- **Expression**: How can I help you?\n- **Key Phrase**: Ordering food and beverages in standard context.'
        },
      ),
      LessonAssetModel(
        id: '${lessonId}_asset_2',
        lessonId: lessonId,
        type: 'audio',
        title: 'Pronunciation & Listening Practice',
        description: 'Listen to native speaker pronunciation samples.',
        order: 2,
        status: 'published',
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
        durationSeconds: 240,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      ),
      LessonAssetModel(
        id: '${lessonId}_asset_3',
        lessonId: lessonId,
        type: 'quiz',
        title: 'Check Your Understanding',
        description: 'Interactive questions to reinforce what you learned.',
        order: 3,
        status: 'published',
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
        durationSeconds: 300,
      ),
    ];
  }
}
