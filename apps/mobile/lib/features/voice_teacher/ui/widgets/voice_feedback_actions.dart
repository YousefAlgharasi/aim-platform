import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

enum VoiceFeedbackSelection { none, helpful, notHelpful }

class VoiceFeedbackActions extends StatefulWidget {
  final String messageId;
  final VoiceFeedbackSelection initialSelection;
  final void Function(String messageId, String rating, String? comment)?
      onFeedback;

  const VoiceFeedbackActions({
    super.key,
    required this.messageId,
    this.initialSelection = VoiceFeedbackSelection.none,
    this.onFeedback,
  });

  @override
  State<VoiceFeedbackActions> createState() => _VoiceFeedbackActionsState();
}

class _VoiceFeedbackActionsState extends State<VoiceFeedbackActions> {
  late VoiceFeedbackSelection _selection;
  bool _showCommentField = false;
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selection = widget.initialSelection;
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _onSelect(VoiceFeedbackSelection selection) {
    setState(() {
      _selection = selection;
      _showCommentField = selection == VoiceFeedbackSelection.notHelpful;
    });

    if (selection == VoiceFeedbackSelection.helpful) {
      widget.onFeedback?.call(widget.messageId, 'helpful', null);
    }
  }

  void _submitNotHelpful() {
    final comment = _commentController.text.trim();
    widget.onFeedback?.call(
      widget.messageId,
      'not_helpful',
      comment.isEmpty ? null : comment,
    );
    setState(() => _showCommentField = false);
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);

    if (_selection != VoiceFeedbackSelection.none && !_showCommentField) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AimSpacing.space4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _selection == VoiceFeedbackSelection.helpful
                  ? Icons.thumb_up
                  : Icons.thumb_down,
              size: 14,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: AimSpacing.space4),
            Text(
              _selection == VoiceFeedbackSelection.helpful
                  ? l10n.voiceTeacherFeedbackThanks
                  : l10n.voiceTeacherFeedbackSubmitted,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _FeedbackButton(
              icon: Icons.thumb_up_outlined,
              label: l10n.voiceTeacherFeedbackHelpful,
              isSelected: _selection == VoiceFeedbackSelection.helpful,
              onTap: () => _onSelect(VoiceFeedbackSelection.helpful),
            ),
            const SizedBox(width: AimSpacing.space8),
            _FeedbackButton(
              icon: Icons.thumb_down_outlined,
              label: l10n.voiceTeacherFeedbackNotHelpful,
              isSelected: _selection == VoiceFeedbackSelection.notHelpful,
              onTap: () => _onSelect(VoiceFeedbackSelection.notHelpful),
            ),
          ],
        ),
        if (_showCommentField) ...[
          const SizedBox(height: AimSpacing.space8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _commentController,
                  maxLength: 1000,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: l10n.voiceTeacherFeedbackCommentHint,
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AimRadius.sm),
                    ),
                    counterText: '',
                  ),
                  textDirection:
                      isRtl ? TextDirection.rtl : TextDirection.ltr,
                ),
              ),
              const SizedBox(width: AimSpacing.space4),
              IconButton(
                icon: const Icon(Icons.send, size: 20),
                color: AimColors.primary500,
                onPressed: _submitNotHelpful,
                tooltip: l10n.commonSubmit,
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _FeedbackButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FeedbackButton({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      borderRadius: BorderRadius.circular(AimRadius.sm),
      onTap: isSelected ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space8,
          vertical: AimSpacing.space4,
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AimRadius.sm),
          border: Border.all(
            color: isSelected
                ? AimColors.primary500
                : theme.dividerColor,
          ),
          color: isSelected ? AimColors.primary500.withValues(alpha: 0.08) : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: isSelected ? AimColors.primary500 : null),
            const SizedBox(width: AimSpacing.space4),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: isSelected ? AimColors.primary500 : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
