import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../widgets/ds_section.dart';

class DSFormSection extends StatelessWidget {
  const DSFormSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const DSSection(
      title: 'Form Controls',
      children: [
        AIMInput(
          label: 'Default input',
          placeholder: 'Enter text…',
        ),
        AIMInput(
          label: 'With helper text',
          placeholder: 'username@example.com',
          helper: 'Use your institutional email.',
          type: AIMInputType.email,
        ),
        AIMInput(
          label: 'Error state',
          placeholder: 'Enter password',
          error: 'Password must be at least 8 characters.',
          type: AIMInputType.password,
        ),
        AIMInput(
          label: 'Disabled',
          placeholder: 'Cannot edit',
          disabled: true,
        ),
        AIMInput(
          label: 'Required',
          placeholder: 'Full name',
          required: true,
        ),
        AIMInput(
          label: 'Search',
          placeholder: 'Search lessons…',
          type: AIMInputType.search,
          leadingIcon: Icon(Icons.search),
        ),
        _CheckboxRow(),
        _SwitchRow(),
        _RadioRow(),
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
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        AIMCheckbox(
          value: _v1,
          label: 'Unchecked',
          onChanged: (v) => setState(() => _v1 = v ?? false),
        ),
        AIMCheckbox(
          value: _v2,
          label: 'Checked',
          onChanged: (v) => setState(() => _v2 = v ?? false),
        ),
        const AIMCheckbox(
          value: false,
          label: 'Disabled',
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
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        AIMSwitch(
          value: _on,
          label: _on ? 'On' : 'Off',
          onChanged: (v) => setState(() => _on = v),
        ),
        const AIMSwitch(
          value: true,
          label: 'Disabled on',
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
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: [
        for (final (v, l) in [('a', 'Option A'), ('b', 'Option B'), ('c', 'Option C')])
          AIMRadio<String>(
            value: v,
            groupValue: _value,
            label: l,
            onChanged: (x) => setState(() => _value = x ?? _value),
          ),
        AIMRadio<String>(
          value: 'd',
          groupValue: _value,
          label: 'Disabled',
          disabled: true,
          onChanged: null,
        ),
      ],
    );
  }
}
