import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_teacher_remote_datasource.dart';
import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_teacher_remote_datasource_impl.dart';
import 'package:aim_mobile/features/voice_teacher/data/repository/voice_teacher_repository_impl.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_teacher_session_state.dart';
import 'package:aim_mobile/features/voice_teacher/logic/repository/voice_teacher_repository.dart';

import 'voice_playback_notifier.dart';
import 'voice_record_submit_notifier.dart';
import 'voice_teacher_session_notifier.dart';

final voiceTeacherRemoteDatasourceProvider =
    Provider<VoiceTeacherRemoteDatasource>((ref) {
  return VoiceTeacherRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final voiceTeacherRepositoryProvider = Provider<VoiceTeacherRepository>((ref) {
  return VoiceTeacherRepositoryImpl(
    datasource: ref.watch(voiceTeacherRemoteDatasourceProvider),
  );
});

final voiceTeacherSessionProvider = StateNotifierProvider.autoDispose<
    VoiceTeacherSessionNotifier, AppAsyncState<VoiceTeacherSessionState>>(
  (ref) => VoiceTeacherSessionNotifier(
    repository: ref.watch(voiceTeacherRepositoryProvider),
  ),
);

/// Drives the record/stop/submitting/success/error states (P18-065) for the
/// student's current recording turn.
final voiceRecordSubmitProvider =
    ChangeNotifierProvider.autoDispose<VoiceRecordSubmitNotifier>(
  (ref) => VoiceRecordSubmitNotifier(),
);

/// Drives the AI Teacher audio playback states (P18-065).
final voicePlaybackProvider =
    ChangeNotifierProvider.autoDispose<VoicePlaybackNotifier>(
  (ref) => VoicePlaybackNotifier(),
);
