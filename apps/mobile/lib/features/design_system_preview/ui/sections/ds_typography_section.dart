import 'package:flutter/material.dart';

import '../../../../core/theme/theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSTypographySection extends StatelessWidget {
  const DSTypographySection({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    TextStyle s(TextStyle base) => base.copyWith(color: surfaces.textPrimary);

    return DSSection(
      title: l10n.dsPreviewSectionTypography,
      children: [
        _sample('Display', AimTextStyles.display, s(AimTextStyles.display),
            'The quick brown fox'),
        _sample('H1', AimTextStyles.h1, s(AimTextStyles.h1), 'Heading 1'),
        _sample('H2', AimTextStyles.h2, s(AimTextStyles.h2), 'Heading 2'),
        _sample('H3', AimTextStyles.h3, s(AimTextStyles.h3), 'Heading 3'),
        _sample('Title', AimTextStyles.title, s(AimTextStyles.title), 'Title'),
        _sample('Body Lg', AimTextStyles.bodyLg, s(AimTextStyles.bodyLg),
            'Body large — learning content'),
        _sample('Body Md', AimTextStyles.bodyMd, s(AimTextStyles.bodyMd),
            'Body medium — default copy'),
        _sample('Body Sm', AimTextStyles.bodySm, s(AimTextStyles.bodySm),
            'Body small — secondary text'),
        _sample('Caption', AimTextStyles.caption, s(AimTextStyles.caption),
            'Caption — labels and meta'),
        _sample('Label', AimTextStyles.label, s(AimTextStyles.label),
            'Label — UI elements'),
        _sample('Button', AimTextStyles.button, s(AimTextStyles.button),
            'Button text style'),
        _sample(
          'Arabic H1',
          AimTextStyles.arabicH1,
          s(AimTextStyles.arabicH1),
          'مرحباً بكم في منصة AIM',
        ),
        _sample(
          'Arabic Body',
          AimTextStyles.arabicBodyMd,
          s(AimTextStyles.arabicBodyMd),
          'نص عربي — المحتوى التعليمي',
        ),
      ],
    );
  }

  Widget _sample(String name, TextStyle base, TextStyle styled, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              name,
              style: AimTextStyles.caption.copyWith(
                color: AimColors.neutral500,
              ),
            ),
          ),
          Expanded(child: Text(text, style: styled)),
        ],
      ),
    );
  }
}
