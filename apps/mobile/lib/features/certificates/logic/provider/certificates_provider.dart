import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/app_exception.dart';
import '../../../../core/state/app_async_state.dart';
import '../../../../core/state/app_state_notifier.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/logic/provider/auth_token_interceptor_provider.dart';
import '../../data/datasources/certificates_remote_datasource.dart';
import '../../data/datasources/certificates_remote_datasource_impl.dart';
import '../../data/models/certificate_model.dart';
import '../../data/repository/certificates_repository_impl.dart';
import '../repository/certificates_repository.dart';

final certificatesRemoteDatasourceProvider =
    Provider<CertificatesRemoteDatasource>((ref) {
  return CertificatesRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final certificatesRepositoryProvider = Provider<CertificatesRepository>((ref) {
  return CertificatesRepositoryImpl(
    datasource: ref.watch(certificatesRemoteDatasourceProvider),
  );
});

class CertificatesListNotifier
    extends AppStateNotifier<List<CertificateModel>> {
  CertificatesListNotifier({required CertificatesRepository repository})
      : _repository = repository;

  final CertificatesRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final certs = await _repository.getMyCertificates(bearerToken: bearerToken);
      setSuccess(certs);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load certificates',
        code: 'CERTIFICATES_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);
}

final certificatesListProvider = StateNotifierProvider<CertificatesListNotifier,
    AppAsyncState<List<CertificateModel>>>(
  (ref) => CertificatesListNotifier(
    repository: ref.watch(certificatesRepositoryProvider),
  ),
);

final certificateDetailProvider =
    FutureProvider.family<CertificateModel, String>((ref, certificateId) async {
  final authFlow = ref.watch(authFlowProvider);
  final token = authFlow.accessToken;
  if (token == null || token.isEmpty) {
    throw const AppException(
      message: 'Not authenticated',
      code: 'AUTH_REQUIRED',
    );
  }
  final repo = ref.watch(certificatesRepositoryProvider);
  return repo.getCertificateById(
    bearerToken: token,
    certificateId: certificateId,
  );
});
