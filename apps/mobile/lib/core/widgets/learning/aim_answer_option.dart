import 'package:flutter/material.dart';

import '../../design_tokens/design_tokens.dart';
import '../../theme/theme.dart';

/// Visual state for [AIMAnswerOption].
enum AIMAnswerOptionState {
  /// Unselected, selectable.
  defaultState,

  /// Chosen by the user, not yet graded.
  selected,

  /// Chosen and correct after grading.
  correct,

  /// Chosen and incorrect after grading.
  incorrect,

  /// The right answer revealed after the user picked the wrong one.
  reveal,
}

/// Quiz / exercise answer option.
///
/// Drive the look entirely through [state]:
/// - [AIMAnswerOptionState.defaultState] — selectable
/// - [AIMAnswerOptionState.selected] — user's pick, awaiting check
/// - [AIMAnswerOptionState.correct] — right answer (after grading)
/// - [AIMAnswerOptionState.incorrect] — wrong answer (after grading)
/// - [AIMAnswerOptionState.reveal] — correct answer shown when user was wrong
///
/// Graded states ([correct], [incorrect], [reveal]) disable the button
/// automatically. Text aligns to the leading edge for RTL compatibility.
///
/// ```dart
/// AIMAnswerOption(
///   optionKey: 'A',
///   state: AIMAnswerOptionState.selected,
///   onTap: pick,
///   child: const Text('She has lived here.'),
/// )
/// ```
class AIMAnswerOption extends StatefulWidget {
  const AIMAnswerOption({
    required this.child,
    super.key,
    this.state = AIMAnswerOptionState.defaultState,
    this.optionKey,
    this.onTap,
    this.semanticLabel,
  });

  /// Content of the answer (typically a [Text]).
  final Widget child;

  /// Visual / interaction state.
  final AIMAnswerOptionState state;

  /// Letter/number key shown in the leading square (e.g. `"A"`).
  final String? optionKey;

  /// Tap callback. Not called when [state] is a graded state.
  final VoidCallback? onTap;

  /// Accessibility label.
  final String? semanticLabel;

  /// Graded states lock the button.
  bool get _isGraded =>
      state == AIMAnswerOptionState.correct ||
      state == AIMAnswerOptionState.incorrect ||
      state == AIMAnswerOptionState.reveal;

  bool get _isEnabled => !_isGraded && onTap != null;

  @override
  State<AIMAnswerOption> createState() => _AIMAnswerOptionState();
}

class _AIMAnswerOptionState extends State<AIMAnswerOption> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);

    final spec = _resolveSpec(state: widget.state, surfaces: surfaces, soft: soft);

    return Semantics(
      button: true,
      enabled: widget._isEnabled,
      selected: widget.state == AIMAnswerOptionState.selected,
      label: widget.semanticLabel,
      child: AnimatedScale(
        scale: _pressed && widget._isEnabled ? 0.99 : 1.0,
        duration: AimMotion.durationFast,
        curve: AimMotion.easeStandard,
        child: GestureDetector(
          onTapDown: widget._isEnabled
              ? (_) => setState(() => _pressed = true)
              : null,
          onTapUp: widget._isEnabled
              ? (_) => setState(() => _pressed = false)
              : null,
          onTapCancel: widget._isEnabled
              ? () => setState(() => _pressed = false)
              : null,
          onTap: widget._isEnabled ? widget.onTap : null,
          child: AnimatedContainer(
            duration: AimMotion.durationFast,
            curve: AimMotion.easeStandard,
            width: double.infinity,
            padding: const EdgeInsets.all(AimSpacing.space16),
            decoration: BoxDecoration(
              color: spec.backgroundColor,
              border: Border.all(
                color: spec.borderColor,
                width: 1.5,
                strokeAlign: BorderSide.strokeAlignInside,
              ),
              borderRadius: AimRadius.borderMd,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                if (widget.optionKey != null) ...[
                  _KeyBadge(
                    label: widget.optionKey!,
                    background: spec.keyBackground,
                    foreground: spec.keyForeground,
                  ),
                  const SizedBox(width: AimSpacing.space12),
                ],
                Expanded(
                  child: DefaultTextStyle.merge(
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textPrimary),
                    textAlign: TextAlign.start,
                    child: widget.child,
                  ),
                ),
                if (spec.icon != null) ...[
                  const SizedBox(width: AimSpacing.space12),
                  ExcludeSemantics(
                    child: spec.icon!,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Visual specification resolved from state
// ---------------------------------------------------------------------------

class _AnswerSpec {
  const _AnswerSpec({
    required this.backgroundColor,
    required this.borderColor,
    required this.keyBackground,
    required this.keyForeground,
    this.icon,
  });

  final Color backgroundColor;
  final Color borderColor;
  final Color keyBackground;
  final Color keyForeground;
  final Widget? icon;
}

_AnswerSpec _resolveSpec({
  required AIMAnswerOptionState state,
  required AimSurfaceTheme surfaces,
  required AimSoftFillTheme soft,
}) {
  return switch (state) {
    AIMAnswerOptionState.defaultState => _AnswerSpec(
        backgroundColor: surfaces.surface,
        borderColor: surfaces.border,
        keyBackground: surfaces.surfaceSunken,
        keyForeground: surfaces.textSecondary,
      ),
    AIMAnswerOptionState.selected => _AnswerSpec(
        backgroundColor: AimColors.primary50,
        borderColor: AimColors.primary500,
        keyBackground: AimColors.primary500,
        keyForeground: AimColors.neutral0,
      ),
    AIMAnswerOptionState.correct => _AnswerSpec(
        backgroundColor: soft.success,
        borderColor: AimColors.success500,
        keyBackground: AimColors.success500,
        keyForeground: AimColors.neutral0,
        icon: const Icon(Icons.check, color: AimColors.success600, size: 22),
      ),
    AIMAnswerOptionState.incorrect => _AnswerSpec(
        backgroundColor: soft.error,
        borderColor: AimColors.error500,
        keyBackground: AimColors.error500,
        keyForeground: AimColors.neutral0,
        icon: const Icon(Icons.close, color: AimColors.error600, size: 22),
      ),
    AIMAnswerOptionState.reveal => _AnswerSpec(
        backgroundColor: surfaces.surface,
        borderColor: AimColors.success500,
        keyBackground: surfaces.surfaceSunken,
        keyForeground: surfaces.textSecondary,
        icon: const Icon(Icons.check, color: AimColors.success600, size: 22),
      ),
  };
}

// ---------------------------------------------------------------------------
// Key badge (A / B / C / D square)
// ---------------------------------------------------------------------------

class _KeyBadge extends StatelessWidget {
  const _KeyBadge({
    required this.label,
    required this.background,
    required this.foreground,
  });

  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: AimMotion.durationFast,
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: background,
        borderRadius: AimRadius.borderSm,
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: AimTextStyles.label.copyWith(
          color: foreground,
          fontWeight: AimFontWeights.bold,
        ),
      ),
    );
  }
}
