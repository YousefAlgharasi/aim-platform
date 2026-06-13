import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/auth/logic/entity/auth_flow_status.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';

void main() {
  test('auth flow notifier supports placeholder auth state transitions', () {
    final notifier = AuthFlowNotifier();

    expect(notifier.state.status, AuthFlowStatus.checking);

    notifier.completeBootstrap();
    expect(notifier.state.status, AuthFlowStatus.signedOut);

    notifier.signInPlaceholder('learner@example.com');
    expect(notifier.state.status, AuthFlowStatus.signedIn);
    expect(notifier.state.email, 'learner@example.com');
    expect(notifier.state.accessToken, '');

    notifier.signOutPlaceholder();
    expect(notifier.state.status, AuthFlowStatus.signedOut);
    expect(notifier.state.email, isNull);
    expect(notifier.state.accessToken, isNull);
  });
}
