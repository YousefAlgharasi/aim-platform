import 'package:flutter/material.dart';
import '../../../../core/theme/theme.dart';

/// Primary button matching PrimaryButton.tsx from Modern Auth Pages (3)-1.
///
/// Height: 54px | Border-radius: 14px | Shadow: 0 4px 16px rgba(79,70,229,0.2)
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
    final isClickable = enabled && !isLoading && onPressed != null;
    const primaryColor = AimColors.primary500;

    return SizedBox(
      width: double.infinity,
      height: 54,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: isClickable
              ? primaryColor
              : primaryColor.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(14),
          boxShadow: isClickable
              ? [
                  BoxShadow(
                    color: primaryColor.withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            onTap: isClickable ? onPressed : null,
            borderRadius: BorderRadius.circular(14),
            child: Center(
              child: isLoading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text(
                      label,
                      style: AimTextStyles.button.copyWith(
                        color: const Color(0xFFF8FAFC),
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.2,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
