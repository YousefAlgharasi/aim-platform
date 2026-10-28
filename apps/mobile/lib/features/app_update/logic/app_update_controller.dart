import 'package:aim_mobile/core/logging/app_logger.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/app_version_policy.dart';
import '../data/play_store_updater.dart';
import 'app_version_compare.dart';

enum AppUpdateRequirement { none, optional, required }

class AppUpdateState {
  const AppUpdateState({
    this.requirement = AppUpdateRequirement.none,
    this.storeUrl,
    this.optionalHandledByPlay = false,
    this.flexibleUpdateReady = false,
    this.bannerDismissed = false,
  });

  final AppUpdateRequirement requirement;
  final String? storeUrl;

  /// Google Play is already downloading the update in the background, so the
  /// app's own "Update available" banner is not needed.
  final bool optionalHandledByPlay;

  /// A Play flexible update finished downloading and is waiting to install.
  final bool flexibleUpdateReady;

  final bool bannerDismissed;

  bool get showOptionalBanner =>
      requirement == AppUpdateRequirement.optional &&
      !optionalHandledByPlay &&
      !bannerDismissed;

  AppUpdateState copyWith({
    AppUpdateRequirement? requirement,
    String? storeUrl,
    bool? optionalHandledByPlay,
    bool? flexibleUpdateReady,
    bool? bannerDismissed,
  }) {
    return AppUpdateState(
      requirement: requirement ?? this.requirement,
      storeUrl: storeUrl ?? this.storeUrl,
      optionalHandledByPlay:
          optionalHandledByPlay ?? this.optionalHandledByPlay,
      flexibleUpdateReady: flexibleUpdateReady ?? this.flexibleUpdateReady,
      bannerDismissed: bannerDismissed ?? this.bannerDismissed,
    );
  }
}

typedef FetchAppVersionPolicy = Future<AppVersionPolicy> Function(
    String platform);
typedef ReadInstalledVersion = Future<String> Function();
typedef OpenStoreUrl = Future<bool> Function(String url);

/// Decides whether the installed app must or may be updated.
///
/// Two sources, combined:
/// 1. The backend version policy (both platforms): below
///    `minSupportedVersion` → blocking screen; below `latestVersion` →
///    dismissible banner.
/// 2. Google Play In-App Updates (Android only): forced updates open Play's
///    full-screen flow; otherwise a new Play release downloads in the
///    background and the user is offered a restart once it is ready.
class AppUpdateController extends StateNotifier<AppUpdateState> {
  AppUpdateController({
    required String? platform,
    required FetchAppVersionPolicy fetchPolicy,
    required ReadInstalledVersion readInstalledVersion,
    required OpenStoreUrl openStoreUrl,
    PlayStoreUpdater? playUpdater,
  })  : _platform = platform,
        _fetchPolicy = fetchPolicy,
        _readInstalledVersion = readInstalledVersion,
        _openStoreUrl = openStoreUrl,
        _playUpdater = playUpdater,
        super(const AppUpdateState());

  final String? _platform;
  final FetchAppVersionPolicy _fetchPolicy;
  final ReadInstalledVersion _readInstalledVersion;
  final OpenStoreUrl _openStoreUrl;
  final PlayStoreUpdater? _playUpdater;

  bool _checking = false;
  bool _immediateAttempted = false;
  bool _flexibleStarted = false;

  Future<void> check() async {
    final platform = _platform;
    if (platform == null || _checking) return;
    _checking = true;
    try {
      final String installed;
      final AppVersionPolicy policy;
      try {
        installed = await _readInstalledVersion();
        policy = await _fetchPolicy(platform);
      } catch (e, st) {
        // Offline or backend down: keep the last known state, so a first
        // launch never locks the user out over this.
        AppLogger.e('AppUpdate', 'Version policy check failed', e, st);
        return;
      }

      final requirement =
          compareAppVersions(installed, policy.minSupportedVersion) < 0
              ? AppUpdateRequirement.required
              : compareAppVersions(installed, policy.latestVersion) < 0
                  ? AppUpdateRequirement.optional
                  : AppUpdateRequirement.none;

      if (!mounted) return;
      state = state.copyWith(
        requirement: requirement,
        storeUrl: policy.storeUrl,
      );

      if (requirement == AppUpdateRequirement.required) {
        // Auto-open Play's forced flow once per launch; after a cancel the
        // blocking screen's button retries it.
        if (!_immediateAttempted) {
          _immediateAttempted = true;
          await _tryPlayImmediateUpdate();
        }
      } else {
        await _maybeStartPlayFlexibleUpdate();
      }
    } finally {
      _checking = false;
    }
  }

  /// "Update" button on the blocking screen and the banner.
  Future<void> openUpdate() async {
    if (await _tryPlayImmediateUpdate()) return;
    final url = state.storeUrl;
    if (url == null || url.isEmpty) {
      AppLogger.w('AppUpdate', 'No store URL configured for $_platform');
      return;
    }
    await _openStoreUrl(url);
  }

  void dismissBanner() {
    state = state.copyWith(bannerDismissed: true);
  }

  Future<void> completeFlexibleUpdate() async {
    try {
      await _playUpdater?.completeFlexibleUpdate();
    } catch (e, st) {
      AppLogger.e('AppUpdate', 'Completing Play update failed', e, st);
    }
  }

  Future<bool> _tryPlayImmediateUpdate() async {
    final updater = _playUpdater;
    if (updater == null) return false;
    try {
      if (!await updater.isUpdateAvailable()) return false;
      return await updater.performImmediateUpdate();
    } catch (e) {
      // Not installed from Google Play (debug/sideload) — use the store link.
      AppLogger.i('AppUpdate', 'Play immediate update unavailable: $e');
      return false;
    }
  }

  Future<void> _maybeStartPlayFlexibleUpdate() async {
    final updater = _playUpdater;
    if (updater == null || _flexibleStarted) return;
    try {
      if (!await updater.isUpdateAvailable()) return;
      _flexibleStarted = true;
      if (mounted) state = state.copyWith(optionalHandledByPlay: true);
      final downloaded = await updater.startFlexibleUpdate();
      if (!mounted) return;
      state = downloaded
          ? state.copyWith(flexibleUpdateReady: true)
          // User declined Play's prompt: fall back to the app's own banner.
          : state.copyWith(optionalHandledByPlay: false);
    } catch (e) {
      AppLogger.i('AppUpdate', 'Play flexible update unavailable: $e');
      if (mounted && _flexibleStarted) {
        state = state.copyWith(optionalHandledByPlay: false);
      }
    }
  }
}
