import 'package:aim_mobile/features/app_update/data/app_version_policy.dart';
import 'package:aim_mobile/features/app_update/data/play_store_updater.dart';
import 'package:aim_mobile/features/app_update/logic/app_update_controller.dart';
import 'package:aim_mobile/features/app_update/logic/app_version_compare.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakePlayUpdater extends PlayStoreUpdater {
  _FakePlayUpdater({this.flexibleResult = true});

  final bool flexibleResult;
  int immediateCalls = 0;
  int flexibleCalls = 0;

  @override
  Future<bool> isUpdateAvailable() async => true;

  @override
  Future<bool> performImmediateUpdate() async {
    immediateCalls++;
    return false;
  }

  @override
  Future<bool> startFlexibleUpdate() async {
    flexibleCalls++;
    return flexibleResult;
  }

  @override
  Future<void> completeFlexibleUpdate() async {}
}

AppUpdateController _controller({
  String? platform = 'ios',
  String installed = '1.0.0',
  AppVersionPolicy? policy,
  Object? fetchError,
  PlayStoreUpdater? playUpdater,
  List<String>? openedUrls,
}) {
  return AppUpdateController(
    platform: platform,
    fetchPolicy: (_) async {
      if (fetchError != null) throw fetchError;
      return policy ?? AppVersionPolicy.none;
    },
    readInstalledVersion: () async => installed,
    openStoreUrl: (url) async {
      openedUrls?.add(url);
      return true;
    },
    playUpdater: playUpdater,
  );
}

void main() {
  group('compareAppVersions', () {
    test('orders by major, minor, patch numerically', () {
      expect(compareAppVersions('1.0.0', '1.0.1'), lessThan(0));
      expect(compareAppVersions('1.10.0', '1.9.9'), greaterThan(0));
      expect(compareAppVersions('2.0.0', '2.0.0'), 0);
    });

    test('ignores build/pre-release suffixes and missing parts', () {
      expect(compareAppVersions('1.2.0+7', '1.2.0'), 0);
      expect(compareAppVersions('1.2', '1.2.0'), 0);
      expect(compareAppVersions('1.2.0-beta', '1.2.1'), lessThan(0));
    });
  });

  group('AppUpdateController', () {
    test('requires an update below minSupportedVersion', () async {
      final controller = _controller(
        installed: '1.0.0',
        policy: const AppVersionPolicy(
          minSupportedVersion: '1.1.0',
          latestVersion: '1.2.0',
          storeUrl: 'https://apps.apple.com/app/id1',
        ),
      );
      await controller.check();
      expect(controller.state.requirement, AppUpdateRequirement.required);
    });

    test('offers an optional update below latestVersion', () async {
      final controller = _controller(
        installed: '1.1.0',
        policy: const AppVersionPolicy(
          minSupportedVersion: '1.0.0',
          latestVersion: '1.2.0',
        ),
      );
      await controller.check();
      expect(controller.state.requirement, AppUpdateRequirement.optional);
      expect(controller.state.showOptionalBanner, isTrue);

      controller.dismissBanner();
      expect(controller.state.showOptionalBanner, isFalse);
    });

    test('never blocks when the policy cannot be fetched', () async {
      final controller = _controller(fetchError: Exception('offline'));
      await controller.check();
      expect(controller.state.requirement, AppUpdateRequirement.none);
    });

    test('does nothing on unsupported platforms', () async {
      final controller = _controller(
        platform: null,
        policy: const AppVersionPolicy(
          minSupportedVersion: '9.0.0',
          latestVersion: '9.0.0',
        ),
      );
      await controller.check();
      expect(controller.state.requirement, AppUpdateRequirement.none);
    });

    test('openUpdate falls back to the store URL', () async {
      final opened = <String>[];
      final controller = _controller(
        policy: const AppVersionPolicy(
          minSupportedVersion: '2.0.0',
          latestVersion: '2.0.0',
          storeUrl: 'https://apps.apple.com/app/id1',
        ),
        openedUrls: opened,
      );
      await controller.check();
      await controller.openUpdate();
      expect(opened, ['https://apps.apple.com/app/id1']);
    });

    test('Android forced update opens Play immediate flow once per launch',
        () async {
      final play = _FakePlayUpdater();
      final controller = _controller(
        platform: 'android',
        policy: const AppVersionPolicy(
          minSupportedVersion: '2.0.0',
          latestVersion: '2.0.0',
        ),
        playUpdater: play,
      );
      await controller.check();
      await controller.check();
      expect(play.immediateCalls, 1);
      expect(play.flexibleCalls, 0);
    });

    test('Android Play release downloads in background and hides the banner',
        () async {
      final play = _FakePlayUpdater();
      final controller = _controller(
        platform: 'android',
        installed: '1.1.0',
        policy: const AppVersionPolicy(
          minSupportedVersion: '1.0.0',
          latestVersion: '1.2.0',
        ),
        playUpdater: play,
      );
      await controller.check();
      expect(play.flexibleCalls, 1);
      expect(controller.state.flexibleUpdateReady, isTrue);
      expect(controller.state.showOptionalBanner, isFalse);
    });

    test('Android falls back to the banner when the user declines Play',
        () async {
      final play = _FakePlayUpdater(flexibleResult: false);
      final controller = _controller(
        platform: 'android',
        installed: '1.1.0',
        policy: const AppVersionPolicy(
          minSupportedVersion: '1.0.0',
          latestVersion: '1.2.0',
        ),
        playUpdater: play,
      );
      await controller.check();
      expect(controller.state.flexibleUpdateReady, isFalse);
      expect(controller.state.showOptionalBanner, isTrue);
    });
  });
}
