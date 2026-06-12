import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../entity/auth_flow_state.dart';

class AuthFlowNotifier extends StateNotifier<AuthFlowState> {
  AuthFlowNotifier() : super(const AuthFlowState.checking());

  void completeBootstrap() {
    state = const AuthFlowState.signedOut();
  }

  void signIn(String email) {
    state = AuthFlowState.signedIn(email: email);
  }

  void signOut() {
    state = const AuthFlowState.signedOut();
  }

  @Deprecated('Use signIn instead')
  void signInPlaceholder(String email) => signIn(email);

  @Deprecated('Use signOut instead')
  void signOutPlaceholder() => signOut();
}
