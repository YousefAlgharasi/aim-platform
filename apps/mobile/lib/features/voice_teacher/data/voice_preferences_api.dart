// The student's AI Teacher voice choice (Groq English + Arabic voices).
//   GET /student/voice-preferences          languages the admin enabled, their voices and the current choice
//   PUT /student/voice-preferences          { en?: id|null, ar?: id|null }  (null = platform default)
//   GET /student/voice-preferences/preview  a short audio sample of one voice

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';

class VoiceOption {
  const VoiceOption({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.isFemale,
  });

  final String id;
  final String name;
  final String nameAr;
  final bool isFemale;

  factory VoiceOption.fromJson(Map<String, dynamic> json) => VoiceOption(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        nameAr: json['nameAr'] as String? ?? '',
        isFemale: json['gender'] == 'female',
      );
}

class VoiceLanguage {
  const VoiceLanguage({
    required this.code,
    required this.voices,
    required this.selected,
    required this.available,
  });

  /// 'en' or 'ar'.
  final String code;
  final List<VoiceOption> voices;

  /// The chosen voice id, or null for the platform default.
  final String? selected;

  /// Arabic speech needs the Arabic model to be set up by the admin.
  final bool available;

  VoiceLanguage withSelected(String? id) => VoiceLanguage(
        code: code,
        voices: voices,
        selected: id,
        available: available,
      );

  factory VoiceLanguage.fromJson(Map<String, dynamic> json) => VoiceLanguage(
        code: json['code'] as String? ?? 'en',
        voices: ((json['voices'] as List<dynamic>?) ?? const [])
            .map((v) => VoiceOption.fromJson(v as Map<String, dynamic>))
            .toList(),
        selected: json['selected'] as String?,
        available: json['available'] as bool? ?? true,
      );
}

class VoicePreferencesApi {
  const VoicePreferencesApi({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  Future<List<VoiceLanguage>> get() async {
    final envelope = await _apiClient.get<List<VoiceLanguage>>(
      BackendApiPaths.studentVoicePreferences,
      decodeData: (json) => ((json as Map<String, dynamic>)['languages'] as List<dynamic>? ?? const [])
          .map((l) => VoiceLanguage.fromJson(l as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data ?? const [];
  }

  /// Saves one language's voice; [voice] null resets it to the default.
  Future<void> save(String language, String? voice) async {
    await _apiClient.put<Object?>(
      BackendApiPaths.studentVoicePreferences,
      body: {language: voice},
      decodeData: (json) => json,
    );
  }

  Future<List<int>> preview(String language, String voice) {
    return _apiClient.getBytes(BackendApiPaths.studentVoicePreview(language, voice));
  }
}

final voicePreferencesApiProvider = Provider<VoicePreferencesApi>((ref) {
  return VoicePreferencesApi(apiClient: ref.watch(authenticatedBackendApiClientProvider));
});
