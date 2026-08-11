import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Ghost/text button matching TextButton.tsx from Modern Auth Pages (3)-1.
///
/// Transparent background, slate-500 text, 16px font-medium.
class PlacementGhostButton extends StatelessWidget {
  const PlacementGhostButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.enabled = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return SizedBox(
      height: 48,
      child: TextButton(
        onPressed: enabled ? onPressed : null,
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          overlayColor: AimColors.primary500.withValues(alpha: 0.08),
        ),
        child: Text(
          label,
          style: AimTextStyles.button.copyWith(
            color: enabled ? surfaces.textSecondary : surfaces.textMuted,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
