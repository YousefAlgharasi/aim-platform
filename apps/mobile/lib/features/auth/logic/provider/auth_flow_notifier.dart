import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../entity/auth_flow_state.dart';

class AuthFlowNotifier extends StateNotifier<AuthFlowState> {
  AuthFlowNotifier() : super(const AuthFlowState.checking());

  void completeBootstrap() {
    state = const AuthFlowState.signedOut();
  }

  void signInPlaceholder(String email) {
    state = AuthFlowState.signedIn(email: email);
  }

  void signOutPlaceholder() {
    state = const AuthFlowState.signedOut();
  }
}
