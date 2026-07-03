import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSColorSection extends StatelessWidget {
  const DSColorSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return DSSection(
      title: l10n.dsPreviewSectionColors,
      children: [
        _palette(l10n.dsPreviewWordPrimary, [
          AimColors.primary50,
          AimColors.primary100,
          AimColors.primary200,
          AimColors.primary300,
          AimColors.primary400,
          AimColors.primary500,
          AimColors.primary600,
          AimColors.primary700,
          AimColors.primary800,
          AimColors.primary900,
        ]),
        _palette(l10n.dsPreviewWordSecondary, [
          AimColors.secondary50,
          AimColors.secondary200,
          AimColors.secondary400,
          AimColors.secondary500,
          AimColors.secondary700,
          AimColors.secondary900,
        ]),
        _palette(l10n.dsPreviewColorAccent, [
          AimColors.accent50,
          AimColors.accent200,
          AimColors.accent400,
          AimColors.accent500,
          AimColors.accent700,
          AimColors.accent900,
        ]),
        _palette(l10n.dsPreviewColorSemantic, [
          AimColors.success500,
          AimColors.warning500,
          AimColors.error500,
          AimColors.info500,
        ]),
        _palette(l10n.dsPreviewColorNeutral, [
          AimColors.neutral0,
          AimColors.neutral50,
          AimColors.neutral100,
          AimColors.neutral200,
          AimColors.neutral300,
          AimColors.neutral400,
          AimColors.neutral500,
          AimColors.neutral600,
          AimColors.neutral700,
          AimColors.neutral800,
          AimColors.neutral900,
        ]),
        _gradientTile(l10n.dsPreviewGradientAi, AimGradients.ai),
        _gradientTile(l10n.dsPreviewGradientGrowth, AimGradients.growth),
        _gradientTile(l10n.dsPreviewGradientAiSoft, AimGradients.aiSoft),
      ],
    );
  }

  Widget _palette(String name, List<Color> colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name, style: AimTextStyles.caption),
          const SizedBox(height: AimSpacing.space4),
          Row(
            children: colors
                .map(
                  (c) => Expanded(
                    child: Container(
                      height: 28,
                      color: c,
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _gradientTile(String name, LinearGradient gradient) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name, style: AimTextStyles.caption),
          const SizedBox(height: AimSpacing.space4),
          Container(
            height: 28,
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: AimRadius.borderSm,
            ),
          ),
        ],
      ),
    );
  }
}
