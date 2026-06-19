import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/core/widgets/learning/aim_card.dart';

class VoiceTeacherEntryCard extends StatelessWidget {
  final VoidCallback onTap;

  const VoiceTeacherEntryCard({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);

    return AIMCard(
      variant: AIMCardVariant.ai,
      interactive: true,
      onTap: onTap,
      semanticLabel: isRtl ? 'المعلم الصوتي' : 'Voice Teacher',
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AIMColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AIMRadius.md),
            ),
            child: const Icon(
              Icons.mic,
              color: AIMColors.primary,
              size: 24,
            ),
          ),
          SizedBox(width: AIMSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isRtl ? 'المعلم الصوتي' : 'Voice Teacher',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isRtl
                      ? 'تحدث مع معلمك بالصوت'
                      : 'Talk with your teacher using voice',
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
