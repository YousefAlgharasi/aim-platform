import 'package:flutter/material.dart';

import '../../theme/theme.dart';

class AIMTextarea extends StatefulWidget {
  const AIMTextarea({
    super.key,
    this.label,
    this.helper,
    this.error,
    this.required = false,
    this.disabled = false,
    this.controller,
    this.focusNode,
    this.initialValue,
    this.placeholder,
    this.onChanged,
    this.rows = 4,
    this.maxLength,
    this.semanticLabel,
  });

  final String? label;
  final String? helper;
  final String? error;
  final bool required;
  final bool disabled;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? initialValue;
  final String? placeholder;
  final ValueChanged<String>? onChanged;
  final int rows;
  final int? maxLength;
  final String? semanticLabel;

  @override
  State<AIMTextarea> createState() => _AIMTextareaState();
}

class _AIMTextareaState extends State<AIMTextarea> {
  late final TextEditingController? _localController;

  TextEditingController get _effectiveController =>
      widget.controller ?? _localController!;

  @override
  void initState() {
    super.initState();
    _localController = widget.controller == null
        ? TextEditingController(text: widget.initialValue)
        : null;
    _effectiveController.addListener(_handleTextChanged);
  }

  @override
  void didUpdateWidget(covariant AIMTextarea oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller?.removeListener(_handleTextChanged);
      widget.controller?.addListener(_handleTextChanged);
    }
  }

  @override
  void dispose() {
    _effectiveController.removeListener(_handleTextChanged);
    _localController?.dispose();
    super.dispose();
  }

  void _handleTextChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hasError = widget.error != null && widget.error!.isNotEmpty;
    final foreground =
        widget.disabled ? surfaces.disabledFg : surfaces.textPrimary;
    final count = _effectiveController.text.characters.length;

    final textarea = DecoratedBox(
      decoration: BoxDecoration(
        color: widget.disabled ? surfaces.disabledBg : surfaces.surfaceSunken,
        border: Border.all(
          color: widget.disabled
              ? surfaces.disabledBorder
              : hasError
                  ? AimColors.error500
                  : surfaces.border,
        ),
        borderRadius: AimRadius.borderSm,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 96),
        child: TextField(
          controller: _effectiveController,
          focusNode: widget.focusNode,
          enabled: !widget.disabled,
          minLines: widget.rows,
          maxLines: null,
          maxLength: widget.maxLength,
          onChanged: widget.onChanged,
          keyboardType: TextInputType.multiline,
          style: AimTextStyles.bodyMd.copyWith(color: foreground),
          decoration: InputDecoration(
            border: InputBorder.none,
            counterText: '',
            hintText: widget.placeholder,
            hintStyle: AimTextStyles.bodyMd.copyWith(
              color: surfaces.textMuted,
            ),
            contentPadding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space16,
              vertical: AimSpacing.space12,
            ),
          ),
        ),
      ),
    );

    return _AIMTextareaShell(
      label: widget.label,
      helper: widget.helper,
      error: widget.error,
      required: widget.required,
      semanticLabel: widget.semanticLabel,
      counter: widget.maxLength == null ? null : '$count/${widget.maxLength}',
      child: textarea,
    );
  }
}

class _AIMTextareaShell extends StatelessWidget {
  const _AIMTextareaShell({
    required this.child,
    this.label,
    this.helper,
    this.error,
    this.required = false,
    this.semanticLabel,
    this.counter,
  });

  final Widget child;
  final String? label;
  final String? helper;
  final String? error;
  final bool required;
  final String? semanticLabel;
  final String? counter;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hasError = error != null && error!.isNotEmpty;
    final supportText = hasError ? error : helper;

    return Semantics(
      textField: true,
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
          if ((supportText != null && supportText.isNotEmpty) ||
              counter != null) ...[
            const SizedBox(height: AimSpacing.space8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    supportText ?? '',
                    style: AimTextStyles.helper.copyWith(
                      color: hasError ? AimColors.error600 : surfaces.textMuted,
                    ),
                  ),
                ),
                if (counter != null)
                  Text(
                    counter!,
                    style: AimTextStyles.helper.copyWith(
                      color: hasError ? AimColors.error600 : surfaces.textMuted,
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
