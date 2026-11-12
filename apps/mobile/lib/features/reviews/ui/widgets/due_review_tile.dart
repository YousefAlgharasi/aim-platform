// One due review: the skill, when it fell due, how serious the weakness is,
// and an arrow. The whole row opens the practice for that skill.

import 'package:flutter/material.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/widgets/widgets.dart';

class DueReviewTile extends StatelessWidget {
  const DueReviewTile({
    super.key,
    required this.name,
    required this.dueAt,
    required this.onTap,
    this.severity,
  });

  final String name;

  /// ISO date-time the review fell due.
  final String dueAt;

  /// 'critical' | 'developing' | 'emerging', or null.
  final String? severity;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    const tone = Color(0xFFF59E0B);
    final date = dueAt.length >= 10 ? dueAt.substring(0, 10) : dueAt;
    final (String? label, Color chip) = switch (severity) {
      'critical' => (context.tr('Needs focus', 'يحتاج تركيزاً'), AimColors.error500),
      'developing' => (context.tr('Getting there', 'في تحسّن'), const Color(0xFFE08A00)),
      _ => (null, surfaces.textMuted),
    };

    return Semantics(
      button: true,
      label: name,
      child: Material(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        child: InkWell(
          borderRadius: BorderRadius.circular(AimRadius.lg),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(color: surfaces.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: tone.withValues(alpha: dark ? 0.24 : 0.14),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.replay_rounded, size: 22, color: tone),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.bodyMd.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Wrap(
                        spacing: 8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(
                            fill(context.tr('Due {date}', 'مستحقة {date}'), {'date': date}),
                            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                          ),
                          if (label != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
                              decoration: BoxDecoration(
                                color: chip.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(100),
                              ),
                              child: Text(
                                label,
                                style: AimTextStyles.caption.copyWith(
                                  color: chip,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AimColors.primary500.withValues(alpha: dark ? 0.22 : 0.10),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                    size: 18,
                    color: dark ? AimColors.primary300 : AimColors.primary600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
