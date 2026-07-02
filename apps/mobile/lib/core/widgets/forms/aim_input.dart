import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMInputType {
  text,
  password,
  search,
  email,
  tel,
  number,
}

enum AIMInputSize {
  small,
  medium,
}

class AIMInput extends StatefulWidget {
  const AIMInput({
    super.key,
    this.label,
    this.helper,
    this.error,
    this.required = false,
    this.disabled = false,
    this.leadingIcon,
    this.trailingIcon,
    this.type = AIMInputType.text,
    this.size = AIMInputSize.medium,
    this.controller,
    this.focusNode,
    this.initialValue,
    this.placeholder,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
    this.autofillHints,
    this.semanticLabel,
  });

  final String? label;
  final String? helper;
  final String? error;
  final bool required;
  final bool disabled;
  final Widget? leadingIcon;

  /// Optional trailing indicator rendered after the built-in password
  /// visibility toggle (or in its place, for non-password fields) — e.g. a
  /// "passwords match" checkmark.
  final Widget? trailingIcon;
  final AIMInputType type;
  final AIMInputSize size;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? initialValue;
  final String? placeholder;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;
  final String? semanticLabel;

  @override
  State<AIMInput> createState() => _AIMInputState();
}

class _AIMInputState extends State<AIMInput> {
  bool _showPassword = false;
  late final TextEditingController? _localController;

  TextEditingController get _effectiveController =>
      widget.controller ?? _localController!;

  @override
  void initState() {
    super.initState();
    _localController = widget.controller == null
        ? TextEditingController(text: widget.initialValue)
        : null;
  }

  @override
  void dispose() {
    _localController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final hasError = widget.error != null && widget.error!.isNotEmpty;
    final foreground =
        widget.disabled ? surfaces.disabledFg : surfaces.textPrimary;
    final borderColor = hasError ? AimColors.error500 : surfaces.border;
    final inputHeight =
        widget.size == AIMInputSize.small ? AimSizes.inputSm : AimSizes.input;

    final field = DecoratedBox(
      decoration: BoxDecoration(
        color: widget.disabled ? surfaces.disabledBg : surfaces.surfaceSunken,
        border: Border.all(
          color: widget.disabled ? surfaces.disabledBorder : borderColor,
        ),
        borderRadius: AimRadius.borderSm,
      ),
      child: SizedBox(
        height: inputHeight,
        child: Padding(
          padding: const EdgeInsetsDirectional.symmetric(
            horizontal: AimSpacing.space16,
          ),
          child: IconTheme.merge(
            data: IconThemeData(color: surfaces.textMuted, size: 18),
            child: Row(
              children: [
                if (widget.leadingIcon != null) ...[
                  widget.leadingIcon!,
                  const SizedBox(width: AimSpacing.space8),
                ],
                Expanded(
                  child: TextField(
                    controller: _effectiveController,
                    focusNode: widget.focusNode,
                    enabled: !widget.disabled,
                    obscureText:
                        widget.type == AIMInputType.password && !_showPassword,
                    keyboardType: widget.type.keyboardType,
                    textInputAction: widget.textInputAction,
                    autofillHints: widget.autofillHints,
                    onChanged: widget.onChanged,
                    onSubmitted: widget.onSubmitted,
                    style: AimTextStyles.bodyMd.copyWith(color: foreground),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                      hintText: widget.placeholder,
                      hintStyle: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textMuted,
                      ),
                    ),
                  ),
                ),
                if (widget.type == AIMInputType.password)
                  Semantics(
                    button: true,
                    label: _showPassword ? 'Hide password' : 'Show password',
                    child: IconButton(
                      constraints: const BoxConstraints(
                        minWidth: AimSizes.touchTarget,
                        minHeight: AimSizes.touchTarget,
                      ),
                      padding: EdgeInsets.zero,
                      iconSize: 18,
                      color: surfaces.textMuted,
                      onPressed: widget.disabled
                          ? null
                          : () => setState(() {
                                _showPassword = !_showPassword;
                              }),
                      icon: Icon(
                        _showPassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                      ),
                    ),
                  ),
                if (widget.trailingIcon != null) ...[
                  const SizedBox(width: AimSpacing.space8),
                  widget.trailingIcon!,
                ],
              ],
            ),
          ),
        ),
      ),
    );

    return _AIMFieldShell(
      label: widget.label,
      helper: widget.helper,
      error: widget.error,
      required: widget.required,
      semanticLabel: widget.semanticLabel,
      errorFocusColor: soft.error,
      child: field,
    );
  }
}

class _AIMFieldShell extends StatelessWidget {
  const _AIMFieldShell({
    required this.child,
    this.label,
    this.helper,
    this.error,
    this.required = false,
    this.semanticLabel,
    this.errorFocusColor,
  });

  final Widget child;
  final String? label;
  final String? helper;
  final String? error;
  final bool required;
  final String? semanticLabel;
  final Color? errorFocusColor;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hasError = error != null && error!.isNotEmpty;
    final supportText = hasError ? error : helper;

    final field = Column(
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
    );

    return Semantics(
      textField: true,
      label: semanticLabel ?? label,
      hint: supportText,
      child: field,
    );
  }
}

extension on AIMInputType {
  TextInputType get keyboardType {
    return switch (this) {
      AIMInputType.text || AIMInputType.password => TextInputType.text,
      AIMInputType.search => TextInputType.text,
      AIMInputType.email => TextInputType.emailAddress,
      AIMInputType.tel => TextInputType.phone,
      AIMInputType.number => TextInputType.number,
    };
  }
}
