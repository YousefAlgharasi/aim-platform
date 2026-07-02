// StudentCoursesRepositoryImpl — data-layer implementation.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/student_courses/data/datasources/student_courses_remote_datasource.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/repository/student_courses_repository.dart';

class StudentCoursesRepositoryImpl implements StudentCoursesRepository {
  const StudentCoursesRepositoryImpl({
    required StudentCoursesRemoteDatasource datasource,
  }) : _datasource = datasource;

  final StudentCoursesRemoteDatasource _datasource;

  @override
  Future<List<StudentCourseModel>> getCourses({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getCourses(bearerToken: bearerToken));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
