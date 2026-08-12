// StudentCoursesRemoteDatasourceImpl — concrete implementation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
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
        final parsed = items
            .whereType<Map<String, dynamic>>()
            .map(StudentCourseModel.fromJson)
            .toList();

        final result = <StudentCourseModel>[];

        for (int i = 0; i < parsed.length; i++) {
          final c = parsed[i];
          final prevCourseCompleted = i > 0 &&
              (parsed[i - 1].status == StudentCourseStatus.completed ||
                  parsed[i - 1].percent == 100);

          final isUnlocked = i == 0 || prevCourseCompleted;

          final updated = StudentCourseModel(
            courseId: c.courseId,
            title: c.title,
            description: c.description,
            levelCode: c.levelCode,
            lessonCount: c.lessonCount,
            completedLessonCount: c.completedLessonCount,
            quizCount: c.quizCount,
            examCount: c.examCount,
            percent: c.percent,
            status: c.status,
            locked: !isUnlocked,
          );
          result.add(updated);
        }

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
