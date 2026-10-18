import '../../logic/repository/certificates_repository.dart';
import '../datasources/certificates_remote_datasource.dart';
import '../models/certificate_model.dart';

class CertificatesRepositoryImpl implements CertificatesRepository {
  const CertificatesRepositoryImpl({
    required CertificatesRemoteDatasource datasource,
  }) : _datasource = datasource;

  final CertificatesRemoteDatasource _datasource;

  @override
  Future<List<CertificateModel>> getMyCertificates({
    required String bearerToken,
  }) =>
      _datasource.getMyCertificates(bearerToken: bearerToken);

  @override
  Future<CertificateModel> getCertificateById({
    required String bearerToken,
    required String certificateId,
  }) =>
      _datasource.getCertificateById(
        bearerToken: bearerToken,
        certificateId: certificateId,
      );
}
