import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSButtonSection extends StatelessWidget {
  const DSButtonSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buttons(l10n),
        _gradientButtons(l10n),
      ],
    );
  }

  Widget _buttons(AppLocalizations l10n) {
    return DSSection(
      title: l10n.dsPreviewTabButtons,
      children: [
        _row('primary', [
          AIMButton(onPressed: () {}, child: Text(l10n.dsPreviewWordPrimary)),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.primary,
            size: AIMButtonSize.small,
            child: Text(l10n.dsPreviewWordSmall),
          ),
          AIMButton(
            disabled: true,
            variant: AIMButtonVariant.primary,
            child: Text(l10n.dsPreviewStateDisabled),
          ),
          AIMButton(
            loading: true,
            onPressed: () {},
            variant: AIMButtonVariant.primary,
            child: Text(l10n.dsPreviewStateLoading),
          ),
        ]),
        _row('secondary / outline / ghost', [
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.secondary,
            child: Text(l10n.dsPreviewWordSecondary),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.outline,
            child: Text(l10n.dsPreviewWordOutline),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.ghost,
            child: Text(l10n.dsPreviewWordGhost),
          ),
        ]),
        _row('destructive / large', [
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.destructive,
            child: Text(l10n.dsPreviewWordDestructive),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.primary,
            size: AIMButtonSize.large,
            child: Text(l10n.dsPreviewWordLarge),
          ),
        ]),
        _row('with icons', [
          AIMButton(
            onPressed: () {},
            leadingIcon: const Icon(Icons.add),
            child: Text(l10n.dsPreviewBtnAddItem),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.outline,
            trailingIcon: const Icon(Icons.arrow_forward),
            child: Text(l10n.commonContinue),
          ),
        ]),
        const SizedBox.shrink(),
        AIMButton(
          onPressed: () {},
          fullWidth: true,
          child: Text(l10n.dsPreviewBtnFullWidthPrimary),
        ),
      ],
    );
  }

  Widget _gradientButtons(AppLocalizations l10n) {
    return DSSection(
      title: l10n.dsPreviewSectionGradientButton,
      children: [
        _row('default / loading / disabled', [
          AIMGradientButton(label: l10n.commonContinue, onPressed: () {}),
          AIMGradientButton(
            label: l10n.dsPreviewStateLoading,
            loading: true,
            onPressed: () {},
          ),
          AIMGradientButton(label: l10n.dsPreviewStateDisabled, enabled: false),
        ]),
        _row('with icon', [
          AIMGradientButton(
            label: l10n.dsPreviewBtnSubscribe,
            icon: const Icon(Icons.star_outline),
            onPressed: () {},
          ),
        ]),
        AIMGradientButton(
          label: l10n.dsPreviewBtnFullWidthGradient,
          fullWidth: true,
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _row(String label, List<Widget> buttons) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: buttons,
      ),
    );
  }
}
