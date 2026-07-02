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
// The text field is a bespoke pill-shaped container (rather than the shared
// AIMInput, which renders a rounded-rectangle field via AimRadius.borderSm)
// built around a bare TextField using AIMInput's own color/text-style token
// patterns, since AIMInput itself is shared and out of scope to modify here.
// The send button is a bespoke circular gradient button (AIMIconButton has
// no gradient-fill variant), reusing AimGradients.gzHero the same way other
// gradient surfaces in this app are built inline rather than forced into a
// shared widget that doesn't support them.
//
// The mic icon is a visible-but-disabled affordance: this codebase has no
// real speech-to-text/dictation infrastructure anywhere (no such package in
// pubspec.yaml, and the separate Voice Teacher feature likewise documents
// that microphone capture isn't wired to a recorder plugin yet). It mirrors
// the same "shown per design, not wired" convention used for the disabled
// social-login buttons on register_page.dart and the disabled bookmark icon
// on the lesson detail screen. It must not be wired to Voice Teacher
// navigation or simulate any recording behavior.
//
// RTL/Arabic rules:
// - The send button is a trailing Row element, so it mirrors under RTL
//   automatically; no hard-coded TextDirection or Alignment is used.
// - The pill field lays out its mic icon via a Row before the (RTL-mirrored)
//   trailing send button, using EdgeInsetsDirectional throughout.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Chat message input row: pill-shaped text field (with a disabled mic
/// affordance) plus a circular gradient send button.
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
    final surfaces = aimSurfacesOf(context);
    final foreground =
        widget.isSending ? surfaces.disabledFg : surfaces.textPrimary;

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.innerGap,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Semantics(
              textField: true,
              label: 'AI Teacher message input',
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: widget.isSending
                      ? surfaces.disabledBg
                      : surfaces.surface,
                  border: Border.all(
                    color: widget.isSending
                        ? surfaces.disabledBorder
                        : surfaces.border,
                  ),
                  borderRadius: AimRadius.borderPill,
                ),
                child: SizedBox(
                  height: AimSizes.input,
                  child: Padding(
                    padding: const EdgeInsetsDirectional.only(
                      start: AimSpacing.space16,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: widget.controller,
                            enabled: !widget.isSending,
                            textInputAction: TextInputAction.send,
                            onSubmitted: (_) => _submit(),
                            style: AimTextStyles.bodyMd.copyWith(
                              color: foreground,
                            ),
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              isDense: true,
                              hintText: 'Ask me anything...',
                              hintStyle: AimTextStyles.bodyMd.copyWith(
                                color: surfaces.textMuted,
                              ),
                            ),
                          ),
                        ),
                        // Dictation is not wired to any recorder/speech-to-
                        // text plugin anywhere in this app yet, so the mic is
                        // shown per the design but kept non-interactive
                        // (onPressed: null) rather than faking capture.
                        Semantics(
                          button: true,
                          label: 'Voice input (coming soon)',
                          child: IconButton(
                            constraints: const BoxConstraints(
                              minWidth: AimSizes.touchTarget,
                              minHeight: AimSizes.touchTarget,
                            ),
                            padding: EdgeInsets.zero,
                            iconSize: 18,
                            color: surfaces.textMuted,
                            onPressed: null,
                            icon: const Icon(Icons.mic_none_rounded),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          _SendButton(enabled: _canSend, onPressed: _submit),
        ],
      ),
    );
  }
}

/// Circular gradient-filled send button.
///
/// AIMIconButton has no gradient-fill variant (only ghost/solid/soft/
/// outline), so this is a small bespoke widget matching the same
/// bespoke-when-shared-doesn't-fit precedent used for gradient headers
/// elsewhere in this app.
class _SendButton extends StatelessWidget {
  const _SendButton({required this.enabled, required this.onPressed});

  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      button: true,
      enabled: enabled,
      label: 'Send message',
      onTap: enabled ? onPressed : null,
      excludeSemantics: true,
      child: SizedBox.square(
        dimension: AimSizes.touchTarget,
        child: Material(
          color: Colors.transparent,
          shape: const CircleBorder(),
          child: InkWell(
            onTap: enabled ? onPressed : null,
            customBorder: const CircleBorder(),
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: enabled ? AimGradients.gzHero : null,
                color: enabled ? null : surfaces.disabledBg,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.send_rounded,
                size: AimSizes.iconMd,
                color: enabled ? AimColors.neutral0 : surfaces.disabledFg,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
