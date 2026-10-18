import '../models/certificate_model.dart';

abstract class CertificatesRemoteDatasource {
  /// GET /certificates/my — all certificates for the current authenticated student
  Future<List<CertificateModel>> getMyCertificates({
    required String bearerToken,
  });

  /// GET /certificates/:id — certificate details
  Future<CertificateModel> getCertificateById({
    required String bearerToken,
    required String certificateId,
  });
}
