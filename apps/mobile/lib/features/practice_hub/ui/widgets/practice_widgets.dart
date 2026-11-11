// Practice screen building blocks: the 5-minute plan banner and the skill
// tiles. Colours come from the theme, so both themes share one layout.

import 'package:flutter/material.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/widgets/widgets.dart';

/// "Your 5-minute plan": a clock, the title and one line of detail, and a
/// royal-blue "Start now" button.
class PracticePlanBanner extends StatelessWidget {
  const PracticePlanBanner({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onStart,
  });

  final String title;
  final String subtitle;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final rtl = Directionality.of(context) == TextDirection.rtl;

    final button = Semantics(
      button: true,
      child: Material(
        color: AimColors.primary500,
        shape: const StadiumBorder(),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onStart,
          child: Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(14, 9, 8, 9),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  context.tr('Start now', 'ابدأ الآن'),
                  style: AimTextStyles.bodySm.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 2),
                Icon(
                  rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                  size: 18,
                  color: Colors.white,
                ),
              ],
            ),
          ),
        ),
      ),
    );

    final texts = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: AimTextStyles.bodyLg.copyWith(
            color: surfaces.textPrimary,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
        ),
      ],
    );

    final clock = Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: AimColors.primary500.withValues(alpha: dark ? 0.28 : 0.14),
        shape: BoxShape.circle,
      ),
      child: Icon(
        Icons.schedule_rounded,
        size: 24,
        color: dark ? AimColors.primary300 : AimColors.primary600,
      ),
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        // Roomy: everything on one row. Narrow screens or large text: the
        // button drops under the text so nothing is squeezed or clipped.
        final stacked = constraints.maxWidth < 340 ||
            MediaQuery.textScalerOf(context).scale(14) > 16.5;
        return Container(
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: AlignmentDirectional.centerStart,
              end: AlignmentDirectional.centerEnd,
              colors: dark
                  ? [AimColors.primary500.withValues(alpha: 0.30), AimColors.primary500.withValues(alpha: 0.16)]
                  : [AimColors.primary500.withValues(alpha: 0.10), AimColors.primary500.withValues(alpha: 0.18)],
            ),
            borderRadius: BorderRadius.circular(AimRadius.lg),
            border: Border.all(color: AimColors.primary500.withValues(alpha: dark ? 0.40 : 0.22)),
          ),
          child: stacked
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        clock,
                        const SizedBox(width: 10),
                        Container(width: 1, height: 36, color: surfaces.divider),
                        const SizedBox(width: 10),
                        Expanded(child: texts),
                      ],
                    ),
                    const SizedBox(height: 10),
                    button,
                  ],
                )
              : Row(
                  children: [
                    clock,
                    const SizedBox(width: 10),
                    Container(width: 1, height: 36, color: surfaces.divider),
                    const SizedBox(width: 10),
                    Expanded(child: texts),
                    const SizedBox(width: 8),
                    button,
                  ],
                ),
        );
      },
    );
  }
}

/// One practice skill: tinted icon, a small arrow, a title and a short line.
class PracticeSkillTile extends StatelessWidget {
  const PracticeSkillTile({
    super.key,
    required this.icon,
    required this.tone,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final Color tone;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    final rtl = Directionality.of(context) == TextDirection.rtl;

    return Semantics(
      button: true,
      label: '$title. $subtitle',
      child: Material(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        child: InkWell(
          borderRadius: BorderRadius.circular(AimRadius.lg),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsetsDirectional.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(color: surfaces.border),
              boxShadow: dark
                  ? null
                  : [
                      BoxShadow(
                        color: AimColors.primary500.withValues(alpha: 0.06),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: tone.withValues(alpha: dark ? 0.24 : 0.14),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(icon, size: 22, color: tone),
                    ),
                    const Spacer(),
                    Container(
                      width: 26,
                      height: 26,
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
                const SizedBox(height: 10),
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.bodyLg.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
