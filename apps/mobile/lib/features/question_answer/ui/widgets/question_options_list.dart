// Phase 6 — P6-089
// QuestionOptionsList — renders MCQ / true_false answer choices using
// AIMAnswerOption from the design system.
//
// CRITICAL SECURITY RULE:
// - Flutter NEVER evaluates which option is correct.
// - All options are rendered in defaultState or selected state only during
//   an active question. No correct/incorrect/reveal states are set locally.
// - Option order comes from the backend (AnswerOption.order); Flutter
//   never reorders choices.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_answer_entities.dart';

class QuestionOptionsList extends StatelessWidget {
  const QuestionOptionsList({
    required this.options,
    required this.selectedOptionId,
    required this.onOptionTapped,
    this.disabled = false,
    super.key,
  });

  final List<AnswerOption> options;
  final String? selectedOptionId;
  final ValueChanged<String> onOptionTapped;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final sorted = [...options]
      ..sort((a, b) => a.order.compareTo(b.order));

    return Column(
      children: sorted.map((option) {
        final isSelected = option.id == selectedOptionId;
        return Padding(
          padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
          child: AIMAnswerOption(
            key: ValueKey(option.id),
            state: isSelected
                ? AIMAnswerOptionState.selected
                : AIMAnswerOptionState.defaultState,
            onTap: disabled ? null : () => onOptionTapped(option.id),
            semanticLabel: option.text,
            child: Text(option.text),
          ),
        );
      }).toList(),
    );
  }
}
