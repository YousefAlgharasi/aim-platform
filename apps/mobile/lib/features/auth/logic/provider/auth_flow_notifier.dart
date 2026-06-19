import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../entity/auth_flow_state.dart';

class AuthFlowNotifier extends StateNotifier<AuthFlowState> {
  AuthFlowNotifier({Object? repository})
      : super(const AuthFlowState.checking());

  void completeBootstrap() {
    state = const AuthFlowState.signedOut();
  }

  void signIn(String email, {required String accessToken}) {
    state = AuthFlowState.signedIn(email: email, accessToken: accessToken);
  }

  void signOut() {
    state = const AuthFlowState.signedOut();
  }

  @Deprecated('Use signIn instead')
  void signInPlaceholder(String email) => signIn(email, accessToken: '');

  @Deprecated('Use signOut instead')
  void signOutPlaceholder() => signOut();
}
