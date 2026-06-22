import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/session_store_provider.dart';

import '../entity/notification_entities.dart';
import 'notification_providers.dart';

// P13-054: Student mobile device token registration flow.
//
// This notifier only relays a platform push token (obtained elsewhere, e.g.
// from a push messaging SDK) to the backend. The backend is the sole
// authority on token validity/status — Flutter never marks a token valid
// and never stores provider secrets or service credentials here.
class DeviceTokenNotifier extends StateNotifier<AppAsyncState<DeviceTokenModel>> {
  DeviceTokenNotifier({required this.ref})
      : super(const AppAsyncState.idle());

  final Ref ref;

  Future<void> registerToken(String token, {String? deviceName}) async {
    state = const AppAsyncState.loading();

    try {
      final session = await ref.read(sessionStoreProvider).read();
      if (session == null) {
        state = const AppAsyncState.failure(
          message: 'No active session.',
          code: 'NO_SESSION',
        );
        return;
      }

      final repository = ref.read(notificationRepositoryProvider);
      final registered = await repository.registerDeviceToken(
        session.accessToken,
        platform: ref.read(devicePlatformProvider),
        token: token,
        deviceName: deviceName,
      );

      state = AppAsyncState.success(registered);
    } catch (e) {
      state = AppAsyncState.failure(message: e.toString());
    }
  }

  Future<void> disableToken(String tokenId) async {
    state = const AppAsyncState.loading();

    try {
      final session = await ref.read(sessionStoreProvider).read();
      if (session == null) {
        state = const AppAsyncState.failure(
          message: 'No active session.',
          code: 'NO_SESSION',
        );
        return;
      }

      final repository = ref.read(notificationRepositoryProvider);
      await repository.disableDeviceToken(session.accessToken, tokenId);

      state = const AppAsyncState.idle();
    } catch (e) {
      state = AppAsyncState.failure(message: e.toString());
    }
  }
}

final deviceTokenNotifierProvider =
    StateNotifierProvider<DeviceTokenNotifier, AppAsyncState<DeviceTokenModel>>(
  (ref) => DeviceTokenNotifier(ref: ref),
);
