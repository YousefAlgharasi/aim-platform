import '../models/current_enrollment_model.dart';

abstract class EnrollmentRemoteDatasource {
  /// GET /enrollment/current
  Future<CurrentEnrollmentModel> getCurrent({required String bearerToken});

  /// POST /courses/:id/enroll
  Future<CurrentEnrollmentModel> enroll({
    required String bearerToken,
    required String courseId,
  });
}
