import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/core/widgets/learning/aim_card.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class VoiceTeacherEntryCard extends StatelessWidget {
  final VoidCallback onTap;

  const VoiceTeacherEntryCard({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.ai,
      interactive: true,
      onTap: onTap,
      semanticLabel: l10n.voiceTeacherTitle,
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AimColors.primary500.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AimRadius.md),
            ),
            child: const Icon(
              Icons.mic,
              color: AimColors.primary500,
              size: 24,
            ),
          ),
          const SizedBox(width: AimSpacing.space16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.voiceTeacherTitle,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.voiceTeacherEntrySubtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            isRtl ? Icons.chevron_left : Icons.chevron_right,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ],
      ),
    );
  }
}
