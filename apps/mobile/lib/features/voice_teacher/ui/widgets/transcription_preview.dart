import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

class TranscriptionPreview extends StatelessWidget {
  final String? transcript;
  final bool isLoading;
  final bool isStudent;

  const TranscriptionPreview({
    super.key,
    this.transcript,
    this.isLoading = false,
    this.isStudent = true,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);

    if (isLoading) {
      return _buildContainer(
        context,
        isRtl: isRtl,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(width: AimSpacing.space8),
            Text(
              isRtl ? 'جارٍ التحويل...' : 'Transcribing...',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      );
    }

    if (transcript == null || transcript!.isEmpty) {
      return const SizedBox.shrink();
    }

    final isArabicText = _containsArabic(transcript!);

    return _buildContainer(
      context,
      isRtl: isRtl,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isStudent ? Icons.person : Icons.smart_toy,
                size: 14,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                isStudent
                    ? (isRtl ? 'ما قلته' : 'What you said')
                    : (isRtl ? 'رد المعلم' : 'Teacher response'),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            transcript!,
            style: theme.textTheme.bodyMedium,
            textDirection: isArabicText ? TextDirection.rtl : TextDirection.ltr,
            textAlign: isArabicText ? TextAlign.right : TextAlign.left,
          ),
        ],
      ),
    );
  }

  Widget _buildContainer(
    BuildContext context, {
    required bool isRtl,
    required Widget child,
  }) {
    final theme = Theme.of(context);

    return Align(
      alignment: isStudent
          ? (isRtl ? Alignment.centerLeft : Alignment.centerRight)
          : (isRtl ? Alignment.centerRight : Alignment.centerLeft),
      child: Container(
        margin: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space16,
          vertical: AimSpacing.space4,
        ),
        padding: const EdgeInsets.all(AimSpacing.space8),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        decoration: BoxDecoration(
          color: isStudent
              ? AimColors.primary500.withValues(alpha: 0.06)
              : theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(AimRadius.md),
          border: Border.all(
            color: isStudent
                ? AimColors.primary500.withValues(alpha: 0.15)
                : theme.dividerColor,
          ),
        ),
        child: child,
      ),
    );
  }

  bool _containsArabic(String text) {
    return RegExp(r'[؀-ۿ]').hasMatch(text);
  }
}
