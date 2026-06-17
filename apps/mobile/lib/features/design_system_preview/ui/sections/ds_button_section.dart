import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../widgets/ds_section.dart';

class DSButtonSection extends StatelessWidget {
  const DSButtonSection({super.key});

  @override
  Widget build(BuildContext context) {
    return DSSection(
      title: 'Buttons',
      children: [
        _row('primary', [
          AIMButton(onPressed: () {}, child: const Text('Primary')),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.primary,
            size: AIMButtonSize.small,
            child: const Text('Small'),
          ),
          AIMButton(
            disabled: true,
            variant: AIMButtonVariant.primary,
            child: const Text('Disabled'),
          ),
          AIMButton(
            loading: true,
            onPressed: () {},
            variant: AIMButtonVariant.primary,
            child: const Text('Loading'),
          ),
        ]),
        _row('secondary / outline / ghost', [
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.secondary,
            child: const Text('Secondary'),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.outline,
            child: const Text('Outline'),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.ghost,
            child: const Text('Ghost'),
          ),
        ]),
        _row('destructive / large', [
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.destructive,
            child: const Text('Destructive'),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.primary,
            size: AIMButtonSize.large,
            child: const Text('Large'),
          ),
        ]),
        _row('with icons', [
          AIMButton(
            onPressed: () {},
            leadingIcon: const Icon(Icons.add),
            child: const Text('Add item'),
          ),
          AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.outline,
            trailingIcon: const Icon(Icons.arrow_forward),
            child: const Text('Continue'),
          ),
        ]),
        const SizedBox.shrink(),
        AIMButton(
          onPressed: () {},
          fullWidth: true,
          child: const Text('Full Width Primary'),
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
