// StudentCoursesRemoteDatasourceImpl — concrete implementation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'student_courses_remote_datasource.dart';

class StudentCoursesRemoteDatasourceImpl
    implements StudentCoursesRemoteDatasource {
  const StudentCoursesRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<StudentCourseModel>> getCourses({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<StudentCourseModel>>(
      BackendApiPaths.studentCourses,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['courses'] as List<dynamic>? ?? [];
        // `locked` is backend-computed from each course's CEFR rank and the
        // student's progress — use it as-is. Re-deriving it from list
        // position locked a course whenever the course listed above it
        // wasn't finished, even when the backend had unlocked it.
        final result = items
            .whereType<Map<String, dynamic>>()
            .map(StudentCourseModel.fromJson)
            .toList();

        return result;
      },
    );
    return envelope.data!;
  }

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected student courses response shape');
    }
    return json;
  }
}
