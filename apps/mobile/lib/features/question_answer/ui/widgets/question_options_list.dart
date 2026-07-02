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

  static const _letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  @override
  Widget build(BuildContext context) {
    final sorted = [...options]
      ..sort((a, b) => a.order.compareTo(b.order));

    return Column(
      children: [
        for (var i = 0; i < sorted.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
            child: AIMAnswerOption(
              key: ValueKey(sorted[i].id),
              // Options carry a real backend UUID, not a display letter, so
              // the A/B/C/D key shown to the student is derived from the
              // backend-supplied display order (AnswerOption.order).
              optionKey: i < _letters.length ? _letters[i] : '${i + 1}',
              state: sorted[i].id == selectedOptionId
                  ? AIMAnswerOptionState.selected
                  : AIMAnswerOptionState.defaultState,
              onTap: disabled ? null : () => onOptionTapped(sorted[i].id),
              semanticLabel: sorted[i].text,
              child: Text(sorted[i].text),
            ),
          ),
      ],
    );
  }
}
