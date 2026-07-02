// Phase 8 — P8-091
// AiSuggestedPromptsRow — suggested tutoring-conversation starter chips.
//
// Purely presentational. The prompt list is a fixed, hard-coded set of
// educational, safe, non-clinical conversation starters; it does not read
// or compute mastery/level/weakness/difficulty/recommendation/review-
// schedule values (docs/phase-8/no-aim-replacement-rule.md). Selecting a
// chip only forwards the prompt text to [onSelect]; it never calls an AI
// provider directly and never derives learning state.
//
// RTL/Arabic rules:
// - Uses a horizontally scrolling ListView, which Flutter lays out
//   start-to-end relative to the ambient Directionality, so it mirrors
//   automatically under RTL with no hard-coded TextDirection/Alignment.
// - Reuses [AIMChip], which already applies RTL-safe internal padding via
//   EdgeInsetsDirectional.
// - Chip labels wrap to a single line with ellipsis to remain stable under
//   Arabic text expansion.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Fixed set of safe, educational conversation starters shown when a chat
/// has no messages yet.
const List<String> kAiSuggestedPrompts = [
  'Explain grammar',
  'Quick quiz',
  'Check my writing',
  'Give an example',
  'Practice speaking',
];

/// Horizontal row of suggested prompt chips.
///
/// Tapping a chip invokes [onSelect] with the prompt text. The chat screen
/// is responsible for placing that text into the input field and/or
/// sending it through [AiTeacherChatNotifier.sendMessage].
class AiSuggestedPromptsRow extends StatelessWidget {
  const AiSuggestedPromptsRow({
    required this.onSelect,
    super.key,
    this.prompts = kAiSuggestedPrompts,
    this.disabled = false,
  });

  final List<String> prompts;
  final bool disabled;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    if (prompts.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: AimSizes.touchTarget,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
        ),
        itemCount: prompts.length,
        separatorBuilder: (_, __) => const SizedBox(width: AimSpacing.space8),
        itemBuilder: (context, index) {
          final prompt = prompts[index];
          return AIMChip(
            disabled: disabled,
            semanticLabel: 'Suggested prompt: $prompt',
            onPressed: disabled ? null : () => onSelect(prompt),
            child: Text(prompt),
          );
        },
      ),
    );
  }
}
