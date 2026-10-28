import 'package:in_app_update/in_app_update.dart';

/// Thin wrapper over Google Play In-App Updates (Android only).
///
/// Every call throws when the app was not installed from Google Play
/// (debug builds, sideloaded APKs); callers treat that as "Play updates
/// unavailable" and fall back to the store link.
class PlayStoreUpdater {
  const PlayStoreUpdater();

  Future<bool> isUpdateAvailable() async {
    final info = await InAppUpdate.checkForUpdate();
    return info.updateAvailability == UpdateAvailability.updateAvailable;
  }

  /// Full-screen Play update. Returns false if the user cancelled or it
  /// failed; on success Play restarts the app.
  Future<bool> performImmediateUpdate() async {
    final result = await InAppUpdate.performImmediateUpdate();
    return result == AppUpdateResult.success;
  }

  /// Background download. Completes once the download has finished (true) or
  /// the user declined (false); call [completeFlexibleUpdate] to install.
  Future<bool> startFlexibleUpdate() async {
    final result = await InAppUpdate.startFlexibleUpdate();
    return result == AppUpdateResult.success;
  }

  Future<void> completeFlexibleUpdate() => InAppUpdate.completeFlexibleUpdate();
}
