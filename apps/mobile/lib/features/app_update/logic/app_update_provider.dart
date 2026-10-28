import 'package:aim_mobile/core/networking/backend_api_client_provider.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/app_version_policy.dart';
import '../data/play_store_updater.dart';
import 'app_update_controller.dart';

String? _currentPlatform() {
  if (kIsWeb) return null;
  return switch (defaultTargetPlatform) {
    TargetPlatform.android => 'android',
    TargetPlatform.iOS => 'ios',
    _ => null,
  };
}

final appUpdateControllerProvider =
    StateNotifierProvider<AppUpdateController, AppUpdateState>((ref) {
  final platform = _currentPlatform();
  final datasource =
      AppVersionRemoteDatasource(ref.watch(backendApiClientProvider));

  return AppUpdateController(
    platform: platform,
    fetchPolicy: datasource.fetchPolicy,
    readInstalledVersion: () async =>
        (await PackageInfo.fromPlatform()).version,
    openStoreUrl: (url) => launchUrl(
      Uri.parse(url),
      mode: LaunchMode.externalApplication,
    ),
    playUpdater: platform == 'android' ? const PlayStoreUpdater() : null,
  );
});
