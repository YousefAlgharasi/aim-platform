import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';



class AuthContextNotifier extends AppStateNotifier<AuthContextModel> {
  AuthContextNotifier({required AuthRepository repository})
      : _repository = repository;

  final AuthRepository _repository;

  Future<void> loadCurrentUser(String bearerToken) async {
    setLoading();
    try {
      final context = await _repository.getMe(bearerToken);
      setSuccess(context);
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : 'Failed to load user',
        code: 'AUTH_LOAD_FAILED',
      );
    }
  }

  Future<void> syncAndLoadUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async {
    setLoading();
    try {
      await _repository.syncUser(
        bearerToken,
        preferredLanguage: preferredLanguage,
        timezone: timezone,
      );
      final context = await _repository.getMe(bearerToken);
      setSuccess(context);
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : 'Failed to sync and load user',
        code: 'AUTH_SYNC_FAILED',
      );
    }
  }

  void clearCurrentUser() {
    reset();
  }
}
