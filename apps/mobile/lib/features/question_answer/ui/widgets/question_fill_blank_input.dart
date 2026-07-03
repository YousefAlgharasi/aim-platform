// Phase 6 — P6-089
// QuestionFillBlankInput — free-text answer input for fill_blank /
// free_text question types.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Question page"
//   docs/design/ui-for-all-system-mobile/screenshots/light/32-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/32-screen.png
//   NOTE: the screenshots depict the multiple-choice branch of the Question
//   page, not this fill-blank branch — there is no design reference for
//   this widget's specific appearance. This is a token-driven visual tidy
//   (matching the AIMInput styling already used elsewhere, e.g.
//   register_page.dart), not a redesign: same controller, same
//   onChanged/disabled wiring, same semantic label as before.
// Endpoints: POST /sessions/start, POST /sessions/:id/attempt
//
// Collects student input only. Flutter never evaluates correctness.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class QuestionFillBlankInput extends StatefulWidget {
  const QuestionFillBlankInput({
    required this.onChanged,
    this.disabled = false,
    super.key,
  });

  final ValueChanged<String> onChanged;
  final bool disabled;

  @override
  State<QuestionFillBlankInput> createState() => _QuestionFillBlankInputState();
}

class _QuestionFillBlankInputState extends State<QuestionFillBlankInput> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    return AIMInput(
      controller: _controller,
      label: loc.questionAnswerYourAnswerLabel,
      helper: loc.questionAnswerAnswerHelperText,
      placeholder: loc.questionAnswerAnswerPlaceholder,
      disabled: widget.disabled,
      onChanged: widget.onChanged,
      textInputAction: TextInputAction.done,
      semanticLabel: loc.questionAnswerAnswerInputSemantic,
    );
  }
}
