// AIMToast — shared action-confirmation toast.
//
// A thin, consistent wrapper over SnackBar so every "you just did
// something" confirmation (marked read, dismissed, saved, submitted...)
// looks and behaves the same across the app, instead of each page hand
// rolling its own bare SnackBar(content: Text(...)).
//
// Purely a presentation helper — never triggers, retries, or interprets
// any backend call itself; callers show a toast only after their own
// mutation has already succeeded (or failed).

import 'package:flutter/material.dart';

import '../../theme/theme.dart';
import 'aim_alert_banner.dart';

class AIMToast {
  const AIMToast._();

  /// Shows a brief, dismissible confirmation toast.
  ///
  /// [tone] defaults to [AIMAlertTone.success] — the common case of
  /// confirming an action completed. Pass [AIMAlertTone.error] for a
  /// mutation that failed but doesn't warrant a full error screen.
  static void show(
    BuildContext context, {
    required String message,
    AIMAlertTone tone = AIMAlertTone.success,
    Duration duration = const Duration(seconds: 3),
  }) {
    final messenger = ScaffoldMessenger.of(context);
    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        duration: duration,
        backgroundColor: Colors.transparent,
        elevation: 0,
        behavior: SnackBarBehavior.floating,
        padding: EdgeInsets.zero,
        margin: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.space16,
        ),
        content: AIMAlertBanner(
          tone: tone,
          semanticLabel: message,
          child: Text(message),
        ),
      ),
    );
  }
}
