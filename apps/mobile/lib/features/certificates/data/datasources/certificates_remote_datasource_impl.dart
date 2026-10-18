import '../../../../core/networking/backend_api_client.dart';
import '../../../../core/networking/backend_api_paths.dart';
import '../models/certificate_model.dart';
import 'certificates_remote_datasource.dart';

class CertificatesRemoteDatasourceImpl implements CertificatesRemoteDatasource {
  const CertificatesRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<CertificateModel>> getMyCertificates({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<CertificateModel>>(
      BackendApiPaths.myCertificates,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is List<dynamic>) {
          return json
              .whereType<Map<String, dynamic>>()
              .map(CertificateModel.fromJson)
              .toList();
        }
        if (json is Map<String, dynamic>) {
          final items = json['certificates'] as List<dynamic>? ??
              json['data'] as List<dynamic>? ??
              [];
          return items
              .whereType<Map<String, dynamic>>()
              .map(CertificateModel.fromJson)
              .toList();
        }
        return <CertificateModel>[];
      },
    );
    return envelope.data ?? const <CertificateModel>[];
  }

  @override
  Future<CertificateModel> getCertificateById({
    required String bearerToken,
    required String certificateId,
  }) async {
    final envelope = await _apiClient.get<CertificateModel>(
      BackendApiPaths.certificateDetail(certificateId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is Map<String, dynamic>) {
          return CertificateModel.fromJson(json);
        }
        throw const FormatException('Unexpected certificate response format');
      },
    );
    if (envelope.data == null) {
      throw const FormatException('Certificate data was null');
    }
    return envelope.data!;
  }
}
