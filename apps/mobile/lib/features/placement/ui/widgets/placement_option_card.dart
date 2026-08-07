import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Reusable selectable card widget used in gate, question, and result screens.
class PlacementOptionCard extends StatelessWidget {
  const PlacementOptionCard({
    super.key,
    required this.title,
    required this.isSelected,
    required this.onTap,
    this.subtitle,
    this.icon,
    this.iconWidget,
    this.trailingValue,
    this.height,
    this.padding = const EdgeInsets.symmetric(
      horizontal: AimSpacing.space16,
      vertical: AimSpacing.space12,
    ),
    this.enabled = true,
  });

  final String title;
  final String? subtitle;
  final Widget? iconWidget;
  final String? icon;
  final String? trailingValue;
  final bool isSelected;
  final VoidCallback? onTap;
  final double? height;
  final EdgeInsetsGeometry padding;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    final cardChild = Row(
      children: [
        if (iconWidget != null) ...[
          iconWidget!,
          const SizedBox(width: AimSpacing.componentGap),
        ] else if (icon != null) ...[
          Text(icon!, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: AimSpacing.componentGap),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: height != null
                ? MainAxisAlignment.spaceBetween
                : MainAxisAlignment.center,
            children: [
              Text(
                title,
                style: AimTextStyles.title.copyWith(
                  fontWeight:
                      isSelected ? AimFontWeights.bold : AimFontWeights.semibold,
                  color: isSelected ? AimColors.primary500 : surfaces.textPrimary,
                ),
              ),
              if (subtitle != null && subtitle!.isNotEmpty) ...[
                const SizedBox(height: AimSpacing.space2),
                Text(
                  subtitle!,
                  style: AimTextStyles.caption.copyWith(
                    color: isSelected
                        ? AimColors.primary500.withValues(alpha: 0.8)
                        : surfaces.textMuted,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (trailingValue != null) ...[
          const SizedBox(width: AimSpacing.space12),
          Text(
            trailingValue!,
            style: AimTextStyles.title.copyWith(
              color: isSelected ? AimColors.primary500 : surfaces.textPrimary,
              fontWeight: AimFontWeights.semibold,
            ),
          ),
        ],
        if (isSelected && trailingValue == null) ...[
          const SizedBox(width: AimSpacing.space12),
          Container(
            width: 20,
            height: 20,
            decoration: const BoxDecoration(
              color: AimColors.primary500,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.check, size: 14, color: surfaces.textOnPrimary),
          ),
        ],
      ],
    );

    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        constraints: height != null ? BoxConstraints(minHeight: height!) : null,
        padding: padding,
        decoration: BoxDecoration(
          color: isSelected
              ? AimColors.primary500.withValues(alpha: 0.08)
              : surfaces.surface,
          borderRadius: AimRadius.borderMd,
          border: Border.all(
            color: isSelected ? AimColors.primary500 : surfaces.border,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: cardChild,
      ),
    );
  }
}
