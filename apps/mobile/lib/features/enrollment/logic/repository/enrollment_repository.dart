import '../entity/current_enrollment.dart';

abstract class EnrollmentRepository {
  Future<CurrentEnrollment> getCurrent({required String bearerToken});

  Future<CurrentEnrollment> enroll({
    required String bearerToken,
    required String courseId,
  });
}
