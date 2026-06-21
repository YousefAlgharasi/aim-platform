import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';

/// A titled section card used throughout the design-system preview.
class DSSection extends StatelessWidget {
  const DSSection({
    required this.title,
    required this.children,
    super.key,
    this.gap = 12,
    this.crossAxisAlignment = CrossAxisAlignment.start,
  });

  final String title;
  final List<Widget> children;
  final double gap;
  final CrossAxisAlignment crossAxisAlignment;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AimSpacing.space16),
            decoration: BoxDecoration(
              color: surfaces.surface,
              border: Border.all(color: surfaces.border),
              borderRadius: AimRadius.borderLg,
            ),
            child: Column(
              crossAxisAlignment: crossAxisAlignment,
              children: [
                for (int i = 0; i < children.length; i++) ...[
                  children[i],
                  if (i < children.length - 1) SizedBox(height: gap),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A labelled row inside a [DSSection].
class DSRow extends StatelessWidget {
  const DSRow({
    required this.label,
    required this.child,
    super.key,
  });

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
          ),
          const SizedBox(height: AimSpacing.space4),
          child,
        ],
      ),
    );
  }
}
