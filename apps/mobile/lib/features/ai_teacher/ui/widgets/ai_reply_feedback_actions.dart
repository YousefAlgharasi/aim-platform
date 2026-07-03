// Phase 8 — P8-092
// AiReplyFeedbackActions — helpful/not-helpful actions for an AI Teacher
// reply message.
//
// Purely presentational + submission forwarding. This widget does not call
// an AI provider directly, does not compute mastery/level/weakness/
// difficulty/recommendation/review-schedule values, and never sends
// studentId (docs/phase-8/no-aim-replacement-rule.md). It only forwards the
// student's helpful/not-helpful tap to [onRate], which the chat screen wires
// to AiTeacherChatNotifier.submitFeedback. Feedback is advisory-only and
// never read by the AIM Engine.
//
// RTL/Arabic rules:
// - Action buttons are laid out in a Row, which mirrors automatically under
//   RTL Directionality; no hard-coded TextDirection/Alignment is used.
// - AIMIconButton already applies RTL-safe internal layout.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// 'helpful' | 'not_helpful', mirrors the backend rating contract exactly
/// (ai-teacher-feedback-submit.types.ts).
enum AiReplyRating { helpful, notHelpful }

extension on AiReplyRating {
  String get wireValue => switch (this) {
        AiReplyRating.helpful => 'helpful',
        AiReplyRating.notHelpful => 'not_helpful',
      };
}

/// Helpful / not-helpful action row shown under an AI Teacher reply bubble.
///
/// Tracks only local, transient submission/selection state for this single
/// message. Selecting a rating disables both buttons while [onRate]'s future
/// resolves, then shows the chosen rating as selected. On failure, selection
/// reverts so the student can retry.
class AiReplyFeedbackActions extends StatefulWidget {
  const AiReplyFeedbackActions({
    required this.messageId,
    required this.onRate,
    super.key,
  });

  final String messageId;
  final Future<void> Function(String messageId, String rating) onRate;

  @override
  State<AiReplyFeedbackActions> createState() =>
      _AiReplyFeedbackActionsState();
}

class _AiReplyFeedbackActionsState extends State<AiReplyFeedbackActions> {
  AiReplyRating? _selected;
  bool _submitting = false;

  Future<void> _handleTap(AiReplyRating rating) async {
    if (_submitting) return;
    setState(() {
      _submitting = true;
      _selected = rating;
    });

    try {
      await widget.onRate(widget.messageId, rating.wireValue);
      if (mounted) setState(() => _submitting = false);
    } catch (_) {
      if (mounted) {
        setState(() {
          _submitting = false;
          _selected = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          l10n.aiTeacherWasHelpfulLabel,
          style: AimTextStyles.caption.copyWith(
            color: surfaces.textSecondary,
          ),
        ),
        const SizedBox(width: AimSpacing.space8),
        _FeedbackIconButton(
          icon: Icons.thumb_up_alt_outlined,
          selectedIcon: Icons.thumb_up_alt_rounded,
          semanticLabel: l10n.aiTeacherMarkHelpfulSemantic,
          selected: _selected == AiReplyRating.helpful,
          disabled: _submitting,
          onPressed: () => _handleTap(AiReplyRating.helpful),
        ),
        const SizedBox(width: AimSpacing.space4),
        _FeedbackIconButton(
          icon: Icons.thumb_down_alt_outlined,
          selectedIcon: Icons.thumb_down_alt_rounded,
          semanticLabel: l10n.aiTeacherMarkNotHelpfulSemantic,
          selected: _selected == AiReplyRating.notHelpful,
          disabled: _submitting,
          onPressed: () => _handleTap(AiReplyRating.notHelpful),
        ),
      ],
    );
  }
}

class _FeedbackIconButton extends StatelessWidget {
  const _FeedbackIconButton({
    required this.icon,
    required this.selectedIcon,
    required this.semanticLabel,
    required this.selected,
    required this.disabled,
    required this.onPressed,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String semanticLabel;
  final bool selected;
  final bool disabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return AIMIconButton(
      icon: Icon(selected ? selectedIcon : icon),
      semanticLabel: semanticLabel,
      size: AIMIconButtonSize.small,
      variant: selected ? AIMIconButtonVariant.soft : AIMIconButtonVariant.ghost,
      disabled: disabled,
      onPressed: disabled ? null : onPressed,
    );
  }
}
