import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

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
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);
    final isArabicText = _containsArabic(fallbackText);

    return Container(
      margin: EdgeInsets.symmetric(
        horizontal: AimSpacing.space16,
        vertical: AimSpacing.space4,
      ),
      padding: EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(AimRadius.md),
        border: Border.all(
          color: AimColors.primary500.withOpacity(0.12),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(
                Icons.text_fields,
                size: 16,
                color: AimColors.primary500,
              ),
              SizedBox(width: AimSpacing.space4),
              Text(
                isRtl ? 'رد نصي من المعلم' : 'Text response from teacher',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: AimColors.primary500,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (originalAudioError != null) ...[
            SizedBox(height: AimSpacing.space4),
            Row(
              children: [
                Icon(
                  Icons.volume_off,
                  size: 14,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                SizedBox(width: AimSpacing.space4),
                Expanded(
                  child: Text(
                    isRtl
                        ? 'لم يتوفر الصوت — إليك الرد النصي'
                        : 'Audio unavailable — here\'s the text response',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              ],
            ),
          ],
          SizedBox(height: AimSpacing.space8),
          Text(
            fallbackText,
            style: theme.textTheme.bodyMedium,
            textDirection: isArabicText ? TextDirection.rtl : TextDirection.ltr,
            textAlign: isArabicText ? TextAlign.right : TextAlign.left,
          ),
          if (onRetryAudio != null) ...[
            SizedBox(height: AimSpacing.space8),
            InkWell(
              borderRadius: BorderRadius.circular(AimRadius.sm),
              onTap: onRetryAudio,
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: AimSpacing.space8,
                  vertical: AimSpacing.space4,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.refresh, size: 16, color: AimColors.primary500),
                    SizedBox(width: AimSpacing.space4),
                    Text(
                      isRtl ? 'إعادة تحميل الصوت' : 'Retry audio',
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
