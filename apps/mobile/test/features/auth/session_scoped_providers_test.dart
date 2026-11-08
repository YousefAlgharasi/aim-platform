import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/session_scoped_providers.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

final _resetProvider = Provider<void Function()>(
  (ref) => () => resetSessionScopedProviders(ref),
);

class _NoopHomeRepository implements HomeRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  test('signing out drops the previous student\'s Home data', () {
    final container = ProviderContainer(
      overrides: [
        homeRepositoryProvider.overrideWithValue(_NoopHomeRepository()),
      ],
    );
    addTearDown(container.dispose);

    container.read(homeProvider.notifier).setSuccess(const HomeData(
          skillStates: [],
          weaknessRecords: [],
          reviewSchedules: [],
          recommendations: [],
        ));
    expect(container.read(homeProvider), isA<AppAsyncSuccess<HomeData>>());

    container.read(_resetProvider)();

    expect(container.read(homeProvider), isA<AppAsyncIdle<HomeData>>());
  });
}
