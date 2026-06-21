import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMAlertTone {
  info,
  success,
  warning,
  error,
}

class AIMAlertBanner extends StatelessWidget {
  const AIMAlertBanner({
    required this.child,
    super.key,
    this.tone = AIMAlertTone.info,
    this.title,
    this.dismissible = false,
    this.onDismiss,
    this.action,
    this.semanticLabel,
    this.dismissSemanticLabel = 'Dismiss',
  });

  final Widget child;
  final AIMAlertTone tone;
  final String? title;
  final bool dismissible;
  final VoidCallback? onDismiss;
  final Widget? action;
  final String? semanticLabel;
  final String dismissSemanticLabel;

  @override
  Widget build(BuildContext context) {
    final colors = _AIMAlertColors.resolve(context, tone);

    final banner = DecoratedBox(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: AimRadius.borderMd,
      ),
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(
          AimSpacing.space16,
          AimSpacing.space12,
          AimSpacing.space12,
          AimSpacing.space12,
        ),
        child: IconTheme.merge(
          data: IconThemeData(color: colors.foreground, size: AimSizes.iconMd),
          child: DefaultTextStyle.merge(
            style: AimTextStyles.bodySm.copyWith(color: colors.foreground),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 1),
                  child: Icon(_iconFor(tone)),
                ),
                const SizedBox(width: AimSpacing.space12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (title != null) ...[
                        Text(
                          title!,
                          style: AimTextStyles.title.copyWith(
                            color: colors.foreground,
                            fontSize: AimTypography.bodyMdSize,
                          ),
                        ),
                        const SizedBox(height: AimSpacing.space2),
                      ],
                      Opacity(opacity: 0.92, child: child),
                      if (action != null) ...[
                        const SizedBox(height: AimSpacing.space8),
                        action!,
                      ],
                    ],
                  ),
                ),
                if (dismissible) ...[
                  const SizedBox(width: AimSpacing.space8),
                  _AlertDismissButton(
                    foreground: colors.foreground,
                    semanticLabel: dismissSemanticLabel,
                    onDismiss: onDismiss,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );

    return Semantics(
      container: true,
      liveRegion: true,
      label: semanticLabel,
      child: banner,
    );
  }

  static IconData _iconFor(AIMAlertTone tone) {
    return switch (tone) {
      AIMAlertTone.info => Icons.info_outline_rounded,
      AIMAlertTone.success => Icons.check_circle_outline_rounded,
      AIMAlertTone.warning => Icons.warning_amber_rounded,
      AIMAlertTone.error => Icons.error_outline_rounded,
    };
  }
}

class _AlertDismissButton extends StatelessWidget {
  const _AlertDismissButton({
    required this.foreground,
    required this.semanticLabel,
    this.onDismiss,
  });

  final Color foreground;
  final String semanticLabel;
  final VoidCallback? onDismiss;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      button: true,
      enabled: onDismiss != null,
      label: semanticLabel,
      onTap: onDismiss,
      child: ExcludeSemantics(
        child: InkResponse(
          onTap: onDismiss,
          radius: AimSizes.touchTarget / 2,
          child: Padding(
            padding: const EdgeInsets.all(AimSpacing.space2),
            child: Opacity(
              opacity: 0.64,
              child: Icon(
                Icons.close_rounded,
                color: foreground,
                size: 18,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

final class _AIMAlertColors {
  const _AIMAlertColors({
    required this.background,
    required this.foreground,
    required this.border,
  });

  final Color background;
  final Color foreground;
  final Color border;

  static _AIMAlertColors resolve(BuildContext context, AIMAlertTone tone) {
    final soft = aimSoftFillsOf(context);

    return switch (tone) {
      AIMAlertTone.info => _AIMAlertColors(
          background: soft.info,
          foreground: soft.onInfo,
          border: AimColors.info500.withValues(alpha: 0.18),
        ),
      AIMAlertTone.success => _AIMAlertColors(
          background: soft.success,
          foreground: soft.onSuccess,
          border: AimColors.success500.withValues(alpha: 0.18),
        ),
      AIMAlertTone.warning => _AIMAlertColors(
          background: soft.warning,
          foreground: soft.onWarning,
          border: AimColors.warning500.withValues(alpha: 0.22),
        ),
      AIMAlertTone.error => _AIMAlertColors(
          background: soft.error,
          foreground: soft.onError,
          border: AimColors.error500.withValues(alpha: 0.18),
        ),
    };
  }
}
