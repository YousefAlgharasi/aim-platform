import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../entity/auth_flow_state.dart';
import 'auth_flow_notifier.dart';

final authFlowProvider =
    StateNotifierProvider<AuthFlowNotifier, AuthFlowState>((ref) {
  return AuthFlowNotifier();
});
