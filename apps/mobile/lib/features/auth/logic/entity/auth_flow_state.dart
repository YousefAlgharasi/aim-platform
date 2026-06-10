import 'auth_flow_status.dart';

class AuthFlowState {
  const AuthFlowState({
    required this.status,
    this.email,
  });

  const AuthFlowState.checking()
      : status = AuthFlowStatus.checking,
        email = null;

  const AuthFlowState.signedOut()
      : status = AuthFlowStatus.signedOut,
        email = null;

  const AuthFlowState.signedIn({
    required String this.email,
  }) : status = AuthFlowStatus.signedIn;

  final AuthFlowStatus status;
  final String? email;

  bool get isChecking => status == AuthFlowStatus.checking;
  bool get isSignedOut => status == AuthFlowStatus.signedOut;
  bool get isSignedIn => status == AuthFlowStatus.signedIn;
}
