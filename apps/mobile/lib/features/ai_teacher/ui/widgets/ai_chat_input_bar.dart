// Phase 8 — P8-087
// AiChatInputBar — chat message input row for the AI Teacher text chat.
//
// This widget is purely presentational/input-handling. It does not call an
// AI provider, an AIM Engine endpoint, or compute any mastery/level/
// weakness/difficulty/recommendation/review-schedule value
// (docs/phase-8/no-aim-replacement-rule.md). It only collects the student's
// text and forwards it to [onSend], which the chat screen wires to
// [AiTeacherChatNotifier.sendMessage].
//
// RTL/Arabic rules:
// - The send button is a trailing Row element, so it mirrors under RTL
//   automatically; no hard-coded TextDirection or Alignment is used.
// - AIMInput already handles RTL-safe leading icon/text layout internally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Chat message input row: text field plus a send button.
///
/// Tracks the controller's text so the send button is disabled whenever the
/// field is empty (after trimming) or whenever [isSending] is true, and
/// submits on both the keyboard "send" action and the send button tap.
class AiChatInputBar extends StatefulWidget {
  const AiChatInputBar({
    required this.controller,
    required this.isSending,
    required this.onSend,
    super.key,
  });

  final TextEditingController controller;
  final bool isSending;
  final Future<void> Function() onSend;

  @override
  State<AiChatInputBar> createState() => _AiChatInputBarState();
}

class _AiChatInputBarState extends State<AiChatInputBar> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onTextChanged);
    super.dispose();
  }

  void _onTextChanged() => setState(() {});

  bool get _hasText => widget.controller.text.trim().isNotEmpty;

  bool get _canSend => _hasText && !widget.isSending;

  void _submit() {
    if (!_canSend) return;
    widget.onSend();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.innerGap,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: AIMInput(
              controller: widget.controller,
              placeholder: 'Ask AI Teacher...',
              disabled: widget.isSending,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _submit(),
              semanticLabel: 'AI Teacher message input',
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          AIMIconButton(
            icon: const Icon(Icons.send_rounded),
            semanticLabel: 'Send message',
            disabled: !_canSend,
            onPressed: _canSend ? _submit : null,
          ),
        ],
      ),
    );
  }
}
