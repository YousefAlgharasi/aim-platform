import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSFormSection extends StatelessWidget {
  const DSFormSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return DSSection(
      title: l10n.dsPreviewSectionFormControls,
      children: [
        AIMInput(
          label: l10n.dsPreviewInputDefaultLabel,
          placeholder: l10n.dsPreviewInputEnterTextPlaceholder,
        ),
        AIMInput(
          label: l10n.dsPreviewInputHelperLabel,
          placeholder: 'username@example.com',
          helper: l10n.dsPreviewInputInstitutionalEmailHelper,
          type: AIMInputType.email,
        ),
        AIMInput(
          label: l10n.dsPreviewInputErrorLabel,
          placeholder: l10n.dsPreviewInputEnterPasswordPlaceholder,
          error: l10n.dsPreviewInputPasswordError,
          type: AIMInputType.password,
        ),
        AIMInput(
          label: l10n.dsPreviewStateDisabled,
          placeholder: l10n.dsPreviewInputCannotEditPlaceholder,
          disabled: true,
        ),
        AIMInput(
          label: l10n.dsPreviewInputRequiredLabel,
          placeholder: l10n.dsPreviewInputFullNamePlaceholder,
          required: true,
        ),
        AIMInput(
          label: l10n.dsPreviewInputSearchLabel,
          placeholder: l10n.dsPreviewInputSearchLessonsPlaceholder,
          type: AIMInputType.search,
          leadingIcon: const Icon(Icons.search),
        ),
        const _CheckboxRow(),
        const _SwitchRow(),
        const _RadioRow(),
      ],
    );
  }
}

class _CheckboxRow extends StatefulWidget {
  const _CheckboxRow();

  @override
  State<_CheckboxRow> createState() => _CheckboxRowState();
}

class _CheckboxRowState extends State<_CheckboxRow> {
  bool _v1 = false;
  bool _v2 = true;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        AIMCheckbox(
          value: _v1,
          label: l10n.dsPreviewCheckboxUnchecked,
          onChanged: (v) => setState(() => _v1 = v ?? false),
        ),
        AIMCheckbox(
          value: _v2,
          label: l10n.dsPreviewCheckboxChecked,
          onChanged: (v) => setState(() => _v2 = v ?? false),
        ),
        AIMCheckbox(
          value: false,
          label: l10n.dsPreviewStateDisabled,
          disabled: true,
        ),
      ],
    );
  }
}

class _SwitchRow extends StatefulWidget {
  const _SwitchRow();

  @override
  State<_SwitchRow> createState() => _SwitchRowState();
}

class _SwitchRowState extends State<_SwitchRow> {
  bool _on = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        AIMSwitch(
          value: _on,
          label: _on ? l10n.dsPreviewSwitchOn : l10n.dsPreviewSwitchOff,
          onChanged: (v) => setState(() => _on = v),
        ),
        AIMSwitch(
          value: true,
          label: l10n.dsPreviewSwitchDisabledOn,
          disabled: true,
        ),
      ],
    );
  }
}

class _RadioRow extends StatefulWidget {
  const _RadioRow();

  @override
  State<_RadioRow> createState() => _RadioRowState();
}

class _RadioRowState extends State<_RadioRow> {
  String _value = 'a';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        for (final (v, l) in [
          ('a', l10n.dsPreviewRadioOptionA),
          ('b', l10n.dsPreviewRadioOptionB),
          ('c', l10n.dsPreviewRadioOptionC),
        ])
          AIMRadio<String>(
            value: v,
            groupValue: _value,
            label: l,
            onChanged: (x) => setState(() => _value = x ?? _value),
          ),
        AIMRadio<String>(
          value: 'd',
          groupValue: _value,
          label: l10n.dsPreviewStateDisabled,
          disabled: true,
          onChanged: null,
        ),
      ],
    );
  }
}
