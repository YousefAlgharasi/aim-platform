import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Reusable secondary / ghost button for placement flow screens (e.g., Skip).
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

    return TextButton(
      onPressed: enabled ? onPressed : null,
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space24,
          vertical: AimSpacing.space8,
        ),
        tapTargetSize: MaterialTapTargetSize.padded,
        overlayColor: AimColors.primary500.withValues(alpha: 0.12),
      ),
      child: Text(
        label,
        style: AimTextStyles.button.copyWith(
          color: enabled ? surfaces.textPrimary : surfaces.textMuted,
        ),
      ),
    );
  }
}
