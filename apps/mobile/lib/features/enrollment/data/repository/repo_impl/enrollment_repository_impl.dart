import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import '../../datasources/enrollment_remote_datasource.dart';
import '../../../logic/entity/current_enrollment.dart';
import '../../../logic/repository/enrollment_repository.dart';

class EnrollmentRepositoryImpl implements EnrollmentRepository {
  const EnrollmentRepositoryImpl({
    required EnrollmentRemoteDatasource datasource,
  }) : _datasource = datasource;

  final EnrollmentRemoteDatasource _datasource;

  @override
  Future<CurrentEnrollment> getCurrent({required String bearerToken}) =>
      _wrap(() => _datasource.getCurrent(bearerToken: bearerToken));

  @override
  Future<CurrentEnrollment> enroll({
    required String bearerToken,
    required String courseId,
  }) =>
      _wrap(() => _datasource.enroll(bearerToken: bearerToken, courseId: courseId));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
