import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Reusable primary button for placement flow screens.
/// Theme-aware, responsive, accessible, supports loading state.
class PlacementPrimaryButton extends StatelessWidget {
  const PlacementPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.enabled = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isClickable = enabled && !isLoading && onPressed != null;

    return SizedBox(
      width: double.infinity,
      height: AimSizes.buttonLg,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: enabled ? AimColors.primary500 : AimColors.primary500.withValues(alpha: 0.5),
          borderRadius: AimRadius.borderMd,
          boxShadow: isClickable
              ? [
                  BoxShadow(
                    color: AimColors.primary500.withValues(alpha: 0.2),
                    blurRadius: 6,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: AimRadius.borderMd,
          child: InkWell(
            onTap: isClickable ? onPressed : null,
            borderRadius: AimRadius.borderMd,
            child: Center(
              child: isLoading
                  ? SizedBox(
                      width: AimSizes.iconMd,
                      height: AimSizes.iconMd,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          surfaces.textOnPrimary,
                        ),
                      ),
                    )
                  : Text(
                      label,
                      style: AimTextStyles.button.copyWith(
                        color: surfaces.textOnPrimary,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
