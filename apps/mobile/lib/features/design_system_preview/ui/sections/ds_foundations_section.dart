import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../widgets/ds_section.dart';

class DSFoundationsSection extends StatelessWidget {
  const DSFoundationsSection({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Spacing
        DSSection(
          title: 'Spacing',
          children: [
            for (final (label, size) in const [
              ('space2', AimSpacing.space2),
              ('space4', AimSpacing.space4),
              ('space8', AimSpacing.space8),
              ('space12', AimSpacing.space12),
              ('space16', AimSpacing.space16),
              ('space20', AimSpacing.space20),
              ('space24', AimSpacing.space24),
              ('space32', AimSpacing.space32),
              ('space40', AimSpacing.space40),
              ('space48', AimSpacing.space48),
            ])
              Row(
                children: [
                  SizedBox(
                    width: 64,
                    child: Text(
                      label,
                      style: AimTextStyles.caption
                          .copyWith(color: surfaces.textMuted),
                    ),
                  ),
                  Container(
                    width: size,
                    height: 16,
                    color: AimColors.primary300,
                  ),
                  const SizedBox(width: AimSpacing.space8),
                  Text(
                    '${size.toInt()} dp',
                    style: AimTextStyles.caption
                        .copyWith(color: surfaces.textSecondary),
                  ),
                ],
              ),
          ],
        ),
        // Radius
        DSSection(
          title: 'Border Radius',
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: AimSpacing.space12,
              runSpacing: AimSpacing.space12,
              children: [
                for (final (label, radius) in [
                  ('xs / 6', AimRadius.borderXs),
                  ('sm / 8', AimRadius.borderSm),
                  ('md / 12', AimRadius.borderMd),
                  ('lg / 16', AimRadius.borderLg),
                  ('xl / 24', AimRadius.borderXl),
                  ('x2l / 32', AimRadius.borderX2l),
                  ('pill', AimRadius.borderPill),
                ])
                  Column(
                    children: [
                      Builder(
                        builder: (context) {
                          final soft = aimSoftFillsOf(context);
                          return Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: soft.primary,
                              borderRadius: radius,
                              border: Border.all(
                                color: AimColors.primary300,
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: AimSpacing.space4),
                      Text(
                        label,
                        style: AimTextStyles.caption
                            .copyWith(color: surfaces.textMuted),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
        // Shadows
        DSSection(
          title: 'Shadows',
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: AimSpacing.space16,
              runSpacing: AimSpacing.space16,
              children: [
                for (final (label, shadow) in [
                  ('card', AimShadows.card),
                  ('cardHover', AimShadows.cardHover),
                  ('dropdown', AimShadows.dropdown),
                  ('modal', AimShadows.modal),
                  ('fab', AimShadows.fab),
                ])
                  Column(
                    children: [
                      Container(
                        width: 64,
                        height: 48,
                        decoration: BoxDecoration(
                          color: surfaces.surface,
                          borderRadius: AimRadius.borderMd,
                          boxShadow: shadow,
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space4),
                      Text(
                        label,
                        style: AimTextStyles.caption
                            .copyWith(color: surfaces.textMuted),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}


