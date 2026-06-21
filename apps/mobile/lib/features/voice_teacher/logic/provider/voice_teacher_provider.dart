import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_teacher_remote_datasource.dart';
import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_teacher_remote_datasource_impl.dart';
import 'package:aim_mobile/features/voice_teacher/data/repository/voice_teacher_repository_impl.dart';
import 'package:aim_mobile/features/voice_teacher/logic/repository/voice_teacher_repository.dart';

final voiceTeacherRemoteDatasourceProvider =
    Provider<VoiceTeacherRemoteDatasource>((ref) {
  return VoiceTeacherRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final voiceTeacherRepositoryProvider =
    Provider<VoiceTeacherRepository>((ref) {
  return VoiceTeacherRepositoryImpl(
    datasource: ref.watch(voiceTeacherRemoteDatasourceProvider),
  );
});
