import '../../data/models/certificate_model.dart';

abstract class CertificatesRepository {
  Future<List<CertificateModel>> getMyCertificates({
    required String bearerToken,
  });

  Future<CertificateModel> getCertificateById({
    required String bearerToken,
    required String certificateId,
  });
}
