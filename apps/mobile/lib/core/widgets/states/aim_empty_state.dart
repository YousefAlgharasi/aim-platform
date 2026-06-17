import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Empty state widget.
///
/// Renders a centred illustration placeholder, a required [title], an optional
/// [subtitle], and an optional [action] button. Use when a list or content area
/// has no items to display.
///
/// All colours and typography come from the AIM design system. Do not pass
/// hard-coded [TextStyle] or [Color] values.
///
/// Example:
/// ```dart
/// AIMEmptyState(
///   icon: Icon(Icons.book_outlined, size: AimSizes.iconLg * 3),
///   title: 'No courses yet',
///   subtitle: 'Your learning plan will appear here once your placement test is complete.',
///   action: AIMButton(
///     child: Text('Take Placement Test'),
///     onPressed: onStartPlacement,
///   ),
/// )
/// ```
class AIMEmptyState extends StatelessWidget {
  const AIMEmptyState({
    required this.title,
    super.key,
    this.icon,
    this.subtitle,
    this.action,
    this.semanticLabel,
  });

  /// Icon or illustration displayed above the title.
  final Widget? icon;

  /// Primary message — required.
  final String title;

  /// Secondary message — optional.
  final String? subtitle;

  /// Optional call-to-action widget, typically an [AIMButton].
  final Widget? action;

  /// Accessibility label for the empty state container.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      label: semanticLabel,
      child: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                IconTheme(
                  data: IconThemeData(
                    color: surfaces.textMuted,
                    size: AimSizes.iconLg * 3,
                  ),
                  child: icon!,
                ),
                SizedBox(height: AimSpacing.sectionGap),
              ],
              Text(
                title,
                style: AimTextStyles.h3.copyWith(
                  color: surfaces.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              if (subtitle != null) ...[
                SizedBox(height: AimSpacing.innerGap),
                Text(
                  subtitle!,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              if (action != null) ...[
                SizedBox(height: AimSpacing.sectionGap),
                action!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
