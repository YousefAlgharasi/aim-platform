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
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Horizontal row of suggested prompt chips.
///
/// Tapping a chip invokes [onSelect] with the prompt text. The chat screen
/// is responsible for placing that text into the input field and/or
/// sending it through [AiTeacherChatNotifier.sendMessage].
///
/// [prompts] is a fixed, app-defined set of safe, educational conversation
/// starters. When not supplied by the caller, a localized default set is
/// used (built in [build] since the chip labels are translated strings).
class AiSuggestedPromptsRow extends StatelessWidget {
  const AiSuggestedPromptsRow({
    required this.onSelect,
    super.key,
    this.prompts,
    this.disabled = false,
  });

  final List<String>? prompts;
  final bool disabled;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final effectivePrompts = prompts ??
        [
          l10n.aiTeacherPromptExplainGrammar,
          l10n.aiTeacherPromptQuickQuiz,
          l10n.aiTeacherPromptCheckWriting,
          l10n.aiTeacherPromptGiveExample,
          l10n.aiTeacherPromptPracticeSpeaking,
        ];

    if (effectivePrompts.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: AimSizes.touchTarget,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
        ),
        itemCount: effectivePrompts.length,
        separatorBuilder: (_, __) => const SizedBox(width: AimSpacing.space8),
        itemBuilder: (context, index) {
          final prompt = effectivePrompts[index];
          return AIMChip(
            disabled: disabled,
            semanticLabel: l10n.aiTeacherSuggestedPromptSemantic(prompt),
            onPressed: disabled ? null : () => onSelect(prompt),
            child: Text(prompt),
          );
        },
      ),
    );
  }
}
