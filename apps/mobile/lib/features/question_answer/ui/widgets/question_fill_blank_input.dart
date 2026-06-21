// Phase 6 — P6-089
// QuestionFillBlankInput — free-text answer input for fill_blank /
// free_text question types.
//
// Collects student input only. Flutter never evaluates correctness.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

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
    return AIMInput(
      controller: _controller,
      label: 'Your answer',
      placeholder: 'Type your answer here',
      disabled: widget.disabled,
      onChanged: widget.onChanged,
      textInputAction: TextInputAction.done,
      semanticLabel: 'Answer input field',
    );
  }
}
