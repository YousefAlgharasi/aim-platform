import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Segmented step progress indicator matching Modern Auth Pages (3)-1 design.
///
/// Segments to the LEFT of `current` are completed (full indigo).
/// The `current` segment is indigo. Remaining are light grey.
/// Height: 4px | Gap between: 6px | Border-radius: 2px
class PlacementProgressBar extends StatelessWidget {
  const PlacementProgressBar({
    super.key,
    required this.total,
    required this.current,
    this.padding = const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile),
  });

  final int total;
  final int current;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    const primaryColor = AimColors.primary500;
    final inactiveColor = isDark
        ? const Color(0xFF334155)
        : const Color(0xFFE2E8F0);

    return Padding(
      padding: padding,
      child: Row(
        children: List.generate(total, (i) {
          final isActive = i == current;
          final isCompleted = i < current;
          final Color segColor = (isActive || isCompleted)
              ? primaryColor
              : inactiveColor;

          return Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              height: 4,
              margin: EdgeInsets.only(right: i < total - 1 ? 6 : 0),
              decoration: BoxDecoration(
                color: segColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }),
      ),
    );
  }
}
