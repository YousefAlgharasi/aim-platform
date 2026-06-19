import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

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

    if (_selection != VoiceFeedbackSelection.none && !_showCommentField) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: AimSpacing.xs),
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
            SizedBox(width: AimSpacing.xs),
            Text(
              _selection == VoiceFeedbackSelection.helpful
                  ? (isRtl ? 'شكراً!' : 'Thanks!')
                  : (isRtl ? 'تم الإرسال' : 'Submitted'),
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
              label: isRtl ? 'مفيد' : 'Helpful',
              isSelected: _selection == VoiceFeedbackSelection.helpful,
              onTap: () => _onSelect(VoiceFeedbackSelection.helpful),
            ),
            SizedBox(width: AimSpacing.sm),
            _FeedbackButton(
              icon: Icons.thumb_down_outlined,
              label: isRtl ? 'غير مفيد' : 'Not helpful',
              isSelected: _selection == VoiceFeedbackSelection.notHelpful,
              onTap: () => _onSelect(VoiceFeedbackSelection.notHelpful),
            ),
          ],
        ),
        if (_showCommentField) ...[
          SizedBox(height: AimSpacing.sm),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _commentController,
                  maxLength: 1000,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: isRtl
                        ? 'أخبرنا بالمزيد (اختياري)'
                        : 'Tell us more (optional)',
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
              SizedBox(width: AimSpacing.xs),
              IconButton(
                icon: const Icon(Icons.send, size: 20),
                color: AimColors.primary,
                onPressed: _submitNotHelpful,
                tooltip: isRtl ? 'إرسال' : 'Submit',
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
        padding: EdgeInsets.symmetric(
          horizontal: AimSpacing.sm,
          vertical: AimSpacing.xs,
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AimRadius.sm),
          border: Border.all(
            color: isSelected
                ? AimColors.primary
                : theme.dividerColor,
          ),
          color: isSelected ? AimColors.primary.withOpacity(0.08) : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: isSelected ? AimColors.primary : null),
            SizedBox(width: AimSpacing.xs),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: isSelected ? AimColors.primary : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
