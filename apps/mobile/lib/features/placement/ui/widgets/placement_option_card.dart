import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Option card matching OptionCard.tsx from Modern Auth Pages (3)-1.
///
/// Shows: icon pill (44×44) | title + subtitle | checkmark badge (24px circle).
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
      horizontal: 16,
      vertical: 14,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    const primaryColor = AimColors.primary500;

    final cardBg = isSelected
        ? primaryColor.withValues(alpha: isDark ? 0.15 : 0.07)
        : (isDark ? const Color(0xFF1E293B) : Colors.white);

    final border = isSelected
        ? Border.all(color: primaryColor, width: 2.0)
        : Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1.0,
          );

    // Icon pill background
    final iconBg = isSelected
        ? primaryColor.withValues(alpha: 0.14)
        : (isDark ? const Color(0xFF334155) : const Color(0xFFEEF2FF));

    // Build the icon pill widget
    Widget? resolvedIcon;
    if (iconWidget != null) {
      // Re-tint the icon color based on selection state
      resolvedIcon = iconWidget;
    } else if (icon != null) {
      resolvedIcon = Text(icon!, style: const TextStyle(fontSize: 22));
    }

    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        constraints:
            height != null ? BoxConstraints(minHeight: height!) : null,
        padding: padding,
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: border,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: primaryColor.withValues(alpha: 0.12),
                    blurRadius: 12,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.02),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
        ),
        child: Row(
          children: [
            // ── Icon pill (44×44) ─────────────────────────────────────
            if (resolvedIcon != null) ...[
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(child: resolvedIcon),
              ),
              const SizedBox(width: 14),
            ],

            // ── Title + Subtitle ──────────────────────────────────────
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: height != null
                    ? MainAxisAlignment.spaceBetween
                    : MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isSelected
                          ? primaryColor
                          : surfaces.textPrimary,
                    ),
                  ),
                  if (subtitle != null && subtitle!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: isSelected
                            ? primaryColor.withValues(alpha: 0.75)
                            : surfaces.textMuted,
                        height: 1.3,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // ── Trailing value or checkmark ───────────────────────────
            if (trailingValue != null) ...[
              const SizedBox(width: AimSpacing.space12),
              Text(
                trailingValue!,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? primaryColor : surfaces.textPrimary,
                ),
              ),
            ] else if (isSelected) ...[
              const SizedBox(width: 12),
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: primaryColor,
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withValues(alpha: 0.30),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Center(
                  child: (iconWidget != null || subtitle != null)
                      ? const Icon(
                          Icons.check_rounded,
                          size: 14,
                          color: Colors.white,
                        )
                      : Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ] else ...[
              const SizedBox(width: 12),
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                    width: 2.0,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
