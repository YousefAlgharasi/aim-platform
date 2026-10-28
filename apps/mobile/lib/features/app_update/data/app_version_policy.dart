import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

/// Backend-owned mobile version policy (GET /app/version-policy).
class AppVersionPolicy {
  const AppVersionPolicy({
    required this.minSupportedVersion,
    required this.latestVersion,
    this.storeUrl,
  });

  factory AppVersionPolicy.fromJson(Map<String, dynamic> json) {
    return AppVersionPolicy(
      minSupportedVersion: json['minSupportedVersion'] as String? ?? '0.0.0',
      latestVersion: json['latestVersion'] as String? ?? '0.0.0',
      storeUrl: json['storeUrl'] as String?,
    );
  }

  /// Policy that never asks the user to update.
  static const AppVersionPolicy none = AppVersionPolicy(
    minSupportedVersion: '0.0.0',
    latestVersion: '0.0.0',
  );

  final String minSupportedVersion;
  final String latestVersion;
  final String? storeUrl;
}

class AppVersionRemoteDatasource {
  const AppVersionRemoteDatasource(this._apiClient);

  final BackendApiClient _apiClient;

  Future<AppVersionPolicy> fetchPolicy(String platform) async {
    final envelope = await _apiClient.get<AppVersionPolicy>(
      BackendApiPaths.appVersionPolicy,
      queryParameters: {'platform': platform},
      decodeData: (json) =>
          AppVersionPolicy.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data ?? AppVersionPolicy.none;
  }
}
