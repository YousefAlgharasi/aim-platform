import 'auth_flow_status.dart';

class AuthFlowState {
  const AuthFlowState({
    required this.status,
    this.email,
    this.accessToken,
  });

  const AuthFlowState.checking()
      : status = AuthFlowStatus.checking,
        email = null,
        accessToken = null;

  const AuthFlowState.signedOut()
      : status = AuthFlowStatus.signedOut,
        email = null,
        accessToken = null;

  const AuthFlowState.signedIn({
    required String this.email,
    required String this.accessToken,
  }) : status = AuthFlowStatus.signedIn;

  final AuthFlowStatus status;
  final String? email;
  final String? accessToken;

  bool get isChecking => status == AuthFlowStatus.checking;
  bool get isSignedOut => status == AuthFlowStatus.signedOut;
  bool get isSignedIn => status == AuthFlowStatus.signedIn;
}
