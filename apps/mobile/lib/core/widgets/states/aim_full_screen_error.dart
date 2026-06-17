import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Full-screen error state.
///
/// Renders a centred error icon, a [message], and an optional [onRetry]
/// callback. Use this widget as the body of a screen when an
/// [AppAsyncFailure] state is active.
///
/// All colours and typography come from the AIM design system. Do not pass
/// hard-coded [TextStyle] or [Color] values.
///
/// Example:
/// ```dart
/// AIMFullScreenError(
///   message: state.message,
///   onRetry: () => ref.invalidate(myProvider),
///   retryLabel: 'Try again',
/// )
/// ```
class AIMFullScreenError extends StatelessWidget {
  const AIMFullScreenError({
    required this.message,
    super.key,
    this.onRetry,
    this.retryLabel = 'Try again',
    this.semanticLabel,
  });

  /// Human-readable error message — typically [AppAsyncFailure.message].
  final String message;

  /// Called when the user taps the retry button. If null, no button is shown.
  final VoidCallback? onRetry;

  /// Label for the retry button. Defaults to 'Try again'.
  final String retryLabel;

  /// Accessibility label for the error state container.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final softFills = aimSoftFillsOf(context);

    return Semantics(
      label: semanticLabel ?? 'Error: $message',
      child: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Error icon in a soft error fill circle
              DecoratedBox(
                decoration: BoxDecoration(
                  color: softFills.error,
                  borderRadius: AimRadius.borderX2l,
                ),
                child: Padding(
                  padding: EdgeInsets.all(AimSpacing.space20),
                  child: Icon(
                    Icons.error_outline_rounded,
                    size: AimSizes.iconLg * 2,
                    color: softFills.onError,
                  ),
                ),
              ),
              SizedBox(height: AimSpacing.sectionGap),
              Text(
                'Something went wrong',
                style: AimTextStyles.h3.copyWith(
                  color: surfaces.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AimSpacing.innerGap),
              Text(
                message,
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              if (onRetry != null) ...[
                SizedBox(height: AimSpacing.sectionGap),
                _AIMRetryButton(
                  label: retryLabel,
                  onPressed: onRetry!,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Internal retry button — uses design system tokens directly to avoid a
/// circular dependency on AIMButton while keeping the widget self-contained.
class _AIMRetryButton extends StatelessWidget {
  const _AIMRetryButton({
    required this.label,
    required this.onPressed,
  });

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return SizedBox(
      height: AimSizes.buttonMd,
      child: Material(
        color: const Color(0x00000000),
        child: InkWell(
          onTap: onPressed,
          borderRadius: AimRadius.borderMd,
          child: DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: surfaces.borderStrong),
              borderRadius: AimRadius.borderMd,
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: AimSpacing.space20,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.refresh_rounded,
                    size: AimSizes.iconMd,
                    color: surfaces.textPrimary,
                  ),
                  SizedBox(width: AimSpacing.innerGap),
                  Text(
                    label,
                    style: AimTextStyles.button.copyWith(
                      color: surfaces.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
