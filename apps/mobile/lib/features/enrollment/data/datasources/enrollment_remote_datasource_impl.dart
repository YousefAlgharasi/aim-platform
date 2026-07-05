import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import '../models/current_enrollment_model.dart';
import 'enrollment_remote_datasource.dart';

class EnrollmentRemoteDatasourceImpl implements EnrollmentRemoteDatasource {
  const EnrollmentRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<CurrentEnrollmentModel> getCurrent({required String bearerToken}) async {
    final envelope = await _apiClient.get<CurrentEnrollmentModel>(
      BackendApiPaths.enrollmentCurrent,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected current-enrollment response shape');
        }
        return CurrentEnrollmentModel.fromJson(json);
      },
    );
    return envelope.data!;
  }

  @override
  Future<CurrentEnrollmentModel> enroll({
    required String bearerToken,
    required String courseId,
  }) async {
    final envelope = await _apiClient.post<CurrentEnrollmentModel>(
      BackendApiPaths.courseEnroll(courseId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected enroll response shape');
        }
        return CurrentEnrollmentModel.fromEnrollResponse(json);
      },
    );
    return envelope.data!;
  }
}
