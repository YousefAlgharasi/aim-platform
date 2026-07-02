import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../theme/theme.dart';

class AIMOTPInput extends StatefulWidget {
  const AIMOTPInput({
    super.key,
    this.length = 4,
    this.value = '',
    this.onChanged,
    this.onCompleted,
    this.error,
    this.label,
    this.helper,
    this.required = false,
    this.disabled = false,
    this.semanticLabel,
  }) : assert(length > 0, 'length must be greater than zero');

  final int length;
  final String value;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onCompleted;
  final String? error;
  final String? label;
  final String? helper;
  final bool required;
  final bool disabled;
  final String? semanticLabel;

  @override
  State<AIMOTPInput> createState() => _AIMOTPInputState();
}

class _AIMOTPInputState extends State<AIMOTPInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  bool _syncing = false;

  @override
  void initState() {
    super.initState();
    _createCells();
    _syncFromValue(widget.value);
  }

  @override
  void didUpdateWidget(covariant AIMOTPInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.length != widget.length) {
      _disposeCells();
      _createCells();
    }

    if (oldWidget.value != widget.value || oldWidget.length != widget.length) {
      _syncFromValue(widget.value);
    }
  }

  @override
  void dispose() {
    _disposeCells();
    super.dispose();
  }

  void _createCells() {
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
  }

  void _disposeCells() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final focusNode in _focusNodes) {
      focusNode.dispose();
    }
  }

  void _syncFromValue(String value) {
    _syncing = true;
    final digits = _digitsOnly(value).padRight(widget.length).characters;
    for (var index = 0; index < widget.length; index += 1) {
      final digit = digits.elementAt(index).trim();
      _controllers[index].text = digit;
      _controllers[index].selection = TextSelection.collapsed(
        offset: digit.length,
      );
    }
    _syncing = false;
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final hasError = widget.error != null && widget.error!.isNotEmpty;

    final cells = Directionality(
      textDirection: TextDirection.ltr,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(widget.length, (index) {
          return Padding(
            padding: EdgeInsetsDirectional.only(
              end: index == widget.length - 1 ? 0 : AimSpacing.space12,
            ),
            child: _OtpCell(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              enabled: !widget.disabled,
              hasError: hasError,
              index: index,
              onChanged: (rawValue) => _handleCellChanged(index, rawValue),
              onBackspaceWhenEmpty: () => _handleBackspace(index),
            ),
          );
        }),
      ),
    );

    return _AIMOtpShell(
      label: widget.label,
      helper: widget.helper,
      error: widget.error,
      required: widget.required,
      semanticLabel: widget.semanticLabel,
      child: DefaultTextStyle.merge(
        style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        child: cells,
      ),
    );
  }

  void _handleCellChanged(int index, String rawValue) {
    if (_syncing) return;

    final digits = _digitsOnly(rawValue);
    if (digits.isEmpty) {
      setState(() {
        _controllers[index].clear();
      });
      _emit();
      return;
    }

    if (digits.length == 1) {
      setState(() {
        _controllers[index].text = digits;
        _controllers[index].selection =
            const TextSelection.collapsed(offset: 1);
      });
      _emit();
      _focusNext(index);
      return;
    }

    var writeIndex = index;
    setState(() {
      for (final digit in digits.characters) {
        if (writeIndex >= widget.length) break;
        _controllers[writeIndex].text = digit;
        _controllers[writeIndex].selection =
            const TextSelection.collapsed(offset: 1);
        writeIndex += 1;
      }
    });

    _emit();
    final nextIndex =
        writeIndex >= widget.length ? widget.length - 1 : writeIndex;
    _focusNodes[nextIndex].requestFocus();
  }

  void _handleBackspace(int index) {
    if (index <= 0 || _controllers[index].text.isNotEmpty) return;
    _focusNodes[index - 1].requestFocus();
    setState(() {
      _controllers[index - 1].clear();
    });
    _emit();
  }

  void _focusNext(int index) {
    if (index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
  }

  void _emit() {
    final code = _controllers.map((controller) => controller.text).join();
    widget.onChanged?.call(code);
    if (code.length == widget.length &&
        _controllers.every((controller) => controller.text.isNotEmpty)) {
      widget.onCompleted?.call(code);
    }
  }

  String _digitsOnly(String value) {
    return value
        .replaceAll(RegExp(r'\D'), '')
        .characters
        .take(widget.length)
        .join();
  }
}

class _OtpCell extends StatelessWidget {
  const _OtpCell({
    required this.controller,
    required this.focusNode,
    required this.enabled,
    required this.hasError,
    required this.index,
    required this.onChanged,
    required this.onBackspaceWhenEmpty,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool enabled;
  final bool hasError;
  final int index;
  final ValueChanged<String> onChanged;
  final VoidCallback onBackspaceWhenEmpty;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            event.logicalKey == LogicalKeyboardKey.backspace &&
            controller.text.isEmpty) {
          onBackspaceWhenEmpty();
        }
        return KeyEventResult.ignored;
      },
      child: SizedBox(
        width: 48,
        height: 56,
        child: TextField(
          controller: controller,
          focusNode: focusNode,
          enabled: enabled,
          textAlign: TextAlign.center,
          textDirection: TextDirection.ltr,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onChanged: onChanged,
          style: AimTextStyles.h2.copyWith(
            color: enabled ? surfaces.textPrimary : surfaces.disabledFg,
          ),
          decoration: InputDecoration(
            counterText: '',
            contentPadding: EdgeInsets.zero,
            filled: true,
            fillColor: enabled ? surfaces.surfaceSunken : surfaces.disabledBg,
            hintTextDirection: TextDirection.ltr,
            enabledBorder: OutlineInputBorder(
              borderRadius: AimRadius.borderMd,
              borderSide: BorderSide(
                color: hasError
                    ? AimColors.error500
                    : controller.text.isEmpty
                        ? surfaces.border
                        : AimColors.primary300,
                width: 1.5,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: AimRadius.borderMd,
              borderSide: BorderSide(
                color: surfaces.disabledBorder,
                width: 1.5,
              ),
            ),
            focusedBorder: const OutlineInputBorder(
              borderRadius: AimRadius.borderMd,
              borderSide: BorderSide(color: AimColors.primary500, width: 1.5),
            ),
          ),
        ),
      ),
    );
  }
}

class _AIMOtpShell extends StatelessWidget {
  const _AIMOtpShell({
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
