import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/logout_provider.dart';

/// A ready-made sign-out button using the AIM Mobile Design System.
///
/// Handles the full logout flow:
/// 1. Calls [LogoutNotifier.logout] with the current bearer token.
/// 2. [LogoutNotifier] clears the persisted session and in-memory auth state.
/// 3. [authFlowProvider] transitions to signedOut.
/// 4. The [AuthGate] (already mounted in the widget tree) navigates to sign-in.
///
/// No manual [Navigator] call is needed — the reactive auth gate handles routing.
///
/// Design system: uses [AIMButton] with [AIMButtonVariant.destructive] to
/// communicate the irreversible nature of sign-out.
///
/// RTL/Arabic: [AIMButton] is direction-neutral; no [TextDirection] is
/// hard-coded here.
///
/// Security:
/// - Bearer token is read from [authFlowProvider], never from user input.
/// - No credentials are stored or logged here.
class LogoutButton extends ConsumerWidget {
  const LogoutButton({
    super.key,
    this.fullWidth = true,
    this.size = AIMButtonSize.medium,
  });

  final bool fullWidth;
  final AIMButtonSize size;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logoutState = ref.watch(logoutProvider);
    final isLoggingOut = logoutState.isLoading;
    final l10n = AppLocalizations.of(context);

    return AIMButton(
      variant: AIMButtonVariant.destructive,
      fullWidth: fullWidth,
      size: size,
      loading: isLoggingOut,
      semanticLabel: l10n.authSignOutSemantic,
      onPressed: isLoggingOut ? null : () => _logout(ref),
      leadingIcon: isLoggingOut
          ? null
          : const Icon(Icons.logout),
      child: Text(l10n.authSignOutButton),
    );
  }

  void _logout(WidgetRef ref) {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(logoutProvider.notifier).logout(token);
  }
}
