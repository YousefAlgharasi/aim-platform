import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AuthContextNotifier extends AppStateNotifier<AuthContextModel> {
  AuthContextNotifier({
    required AuthRepository repository,
    required Ref ref,
  })  : _repository = repository,
        _ref = ref;

  final AuthRepository _repository;
  final Ref _ref;

  Future<bool> loadCurrentUser(String bearerToken, {AppLocalizations? l10n}) async {
    setLoading();
    final fallbackMessage = l10n?.authFailedToLoadUser ?? 'Failed to load user';
    try {
      final context = await _repository.getMe(bearerToken);
      setSuccess(context);
      return true;
    } on AppException catch (e) {
      _handleAuthFailure(
        exception: e,
        fallbackCode: 'AUTH_LOAD_FAILED',
        fallbackMessage: fallbackMessage,
        l10n: l10n,
      );
      return false;
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : fallbackMessage,
        code: 'AUTH_LOAD_FAILED',
      );
      return false;
    }
  }

  Future<bool> syncAndLoadUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
    AppLocalizations? l10n,
  }) async {
    setLoading();
    final fallbackMessage =
        l10n?.authFailedToSyncUser ?? 'Failed to sync and load user';
    try {
      await _repository.syncUser(
        bearerToken,
        preferredLanguage: preferredLanguage,
        timezone: timezone,
      );
      final context = await _repository.getMe(bearerToken);
      setSuccess(context);
      return true;
    } on AppException catch (e) {
      _handleAuthFailure(
        exception: e,
        fallbackCode: 'AUTH_SYNC_FAILED',
        fallbackMessage: fallbackMessage,
        l10n: l10n,
      );
      return false;
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : fallbackMessage,
        code: 'AUTH_SYNC_FAILED',
      );
      return false;
    }
  }

  void clearCurrentUser() {
    reset();
  }

  void _handleAuthFailure({
    required AppException exception,
    required String fallbackCode,
    required String fallbackMessage,
    AppLocalizations? l10n,
  }) {
    if (_isSessionExpired(exception)) {
      clearCurrentUser();
      _ref.read(authFlowProvider.notifier).signOut();
      setFailure(
        message: l10n?.authSessionExpiredError ??
            'Your session has expired. Please sign in again.',
        code: 'AUTH_SESSION_EXPIRED',
      );
      return;
    }

    setFailure(
      message: exception.message.isEmpty ? fallbackMessage : exception.message,
      code: exception.code.isEmpty ? fallbackCode : exception.code,
    );
  }

  bool _isSessionExpired(AppException exception) {
    final normalizedCode = exception.code.toUpperCase();
    return normalizedCode == 'UNAUTHORIZED' ||
        normalizedCode == 'AUTH_UNAUTHORIZED' ||
        normalizedCode == 'AUTH_SESSION_EXPIRED' ||
        normalizedCode == 'SESSION_EXPIRED';
  }
}
