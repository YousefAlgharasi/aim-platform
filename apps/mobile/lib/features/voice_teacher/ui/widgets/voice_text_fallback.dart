import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class VoiceTextFallback extends StatelessWidget {
  final String fallbackText;
  final String? originalAudioError;
  final VoidCallback? onRetryAudio;

  const VoiceTextFallback({
    super.key,
    required this.fallbackText,
    this.originalAudioError,
    this.onRetryAudio,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final isArabicText = _containsArabic(fallbackText);

    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space16,
        vertical: AimSpacing.space4,
      ),
      padding: const EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AimRadius.md),
        border: Border.all(
          color: AimColors.primary500.withValues(alpha: 0.12),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(
                Icons.text_fields,
                size: 16,
                color: AimColors.primary500,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                l10n.voiceTeacherTextResponseLabel,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: AimColors.primary500,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (originalAudioError != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Row(
              children: [
                Icon(
                  Icons.volume_off,
                  size: 14,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: AimSpacing.space4),
                Expanded(
                  child: Text(
                    l10n.voiceTeacherAudioUnavailableLabel,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: AimSpacing.space8),
          Text(
            fallbackText,
            style: theme.textTheme.bodyMedium,
            textDirection: isArabicText ? TextDirection.rtl : TextDirection.ltr,
            textAlign: isArabicText ? TextAlign.right : TextAlign.left,
          ),
          if (onRetryAudio != null) ...[
            const SizedBox(height: AimSpacing.space8),
            InkWell(
              borderRadius: BorderRadius.circular(AimRadius.sm),
              onTap: onRetryAudio,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.space8,
                  vertical: AimSpacing.space4,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.refresh, size: 16, color: AimColors.primary500),
                    const SizedBox(width: AimSpacing.space4),
                    Text(
                      l10n.voiceTeacherRetryAudioLabel,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: AimColors.primary500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  bool _containsArabic(String text) {
    return RegExp(r'[؀-ۿ]').hasMatch(text);
  }
}
