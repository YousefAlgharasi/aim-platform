import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMSelectOption {
  const AIMSelectOption({
    required this.value,
    required this.label,
    this.enabled = true,
  });

  final String value;
  final String label;
  final bool enabled;
}

class AIMSelect extends StatelessWidget {
  const AIMSelect({
    required this.options,
    super.key,
    this.value,
    this.onChanged,
    this.placeholder,
    this.label,
    this.helper,
    this.error,
    this.required = false,
    this.disabled = false,
    this.semanticLabel,
  });

  final List<AIMSelectOption> options;
  final String? value;
  final ValueChanged<String?>? onChanged;
  final String? placeholder;
  final String? label;
  final String? helper;
  final String? error;
  final bool required;
  final bool disabled;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hasError = error != null && error!.isNotEmpty;
    final isEnabled = !disabled && onChanged != null;
    final selectedValue =
        options.any((option) => option.value == value) ? value : null;

    final select = DecoratedBox(
      decoration: BoxDecoration(
        color: disabled ? surfaces.disabledBg : surfaces.surface,
        border: Border.all(
          color: disabled
              ? surfaces.disabledBorder
              : hasError
                  ? AimColors.error500
                  : surfaces.border,
        ),
        borderRadius: AimRadius.borderSm,
      ),
      child: SizedBox(
        height: AimSizes.input,
        child: Padding(
          padding: const EdgeInsetsDirectional.only(
            start: AimSpacing.space16,
            end: AimSpacing.space12,
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedValue,
              hint: placeholder == null
                  ? null
                  : Text(
                      placeholder!,
                      overflow: TextOverflow.ellipsis,
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textMuted,
                      ),
                    ),
              isExpanded: true,
              icon: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: surfaces.textMuted,
                size: 18,
              ),
              borderRadius: AimRadius.borderMd,
              dropdownColor: surfaces.surface,
              style: AimTextStyles.bodyMd.copyWith(
                color: disabled ? surfaces.disabledFg : surfaces.textPrimary,
              ),
              onChanged: isEnabled ? onChanged : null,
              items: options
                  .map(
                    (option) => DropdownMenuItem<String>(
                      value: option.value,
                      enabled: option.enabled,
                      child: Text(
                        option.label,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),
      ),
    );

    return _AIMSelectShell(
      label: label,
      helper: helper,
      error: error,
      required: required,
      semanticLabel: semanticLabel,
      child: select,
    );
  }
}

class _AIMSelectShell extends StatelessWidget {
  const _AIMSelectShell({
    required this.child,
    this.label,
    this.helper,
    this.error,
    this.required = false,
    this.semanticLabel,
  });

  final Widget child;
  final String? label;
  final String? helper;
  final String? error;
  final bool required;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hasError = error != null && error!.isNotEmpty;
    final supportText = hasError ? error : helper;

    return Semantics(
      button: true,
      label: semanticLabel ?? label,
      hint: supportText,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (label != null) ...[
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label!,
                  style: AimTextStyles.label.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
                if (required)
                  const Text(
                    '*',
                    style: TextStyle(color: AimColors.error500),
                  ),
              ],
            ),
            const SizedBox(height: AimSpacing.space8),
          ],
          child,
          if (supportText != null && supportText.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(
              supportText,
              style: AimTextStyles.helper.copyWith(
                color: hasError ? AimColors.error600 : surfaces.textMuted,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
