import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Segmented step progress indicator (e.g. 4 steps in Gate Page).
class PlacementProgressBar extends StatelessWidget {
  const PlacementProgressBar({
    super.key,
    required this.total,
    required this.current,
    this.padding = const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
  });

  final int total;
  final int current;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        children: List.generate(total, (i) {
          final active = i == current;
          return Expanded(
            child: Container(
              height: 5,
              margin: EdgeInsets.only(right: i < total - 1 ? AimSpacing.innerGap : 0),
              decoration: BoxDecoration(
                color: active
                    ? AimColors.primary500
                    : AimColors.primary500.withValues(alpha: 0.2),
                borderRadius: AimRadius.borderSm,
              ),
            ),
          );
        }),
      ),
    );
  }
}
