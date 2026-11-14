// LiveDock — the student's side of the live lesson, at the bottom of the screen: the AIM robot sits on the top-left
// corner of the text box and what it is saying rises from its head as a thought bubble. Inside the box: the teacher's
// voice (mute), the text, and one button that is the live microphone while the box is empty (tap to mute / unmute; the
// conversation itself is hands-free) and "send" once something is typed. Under the box: a button that opens the
// conversation sheet.

import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'aim_robot.dart';
import 'robot_thought.dart';

/// The live microphone as the student sees it: on and listening, hearing them talk, muted, or off.
enum MicMode { live, hearing, muted, off }

/// The robot's height for a screen: it grows with the screen but stays within a minimum and a maximum.
double robotHeightFor(Size screen) => math.min(screen.width * 0.456, screen.height * 0.288).clamp(134.4, 230.4);

class LiveDock extends StatelessWidget {
  const LiveDock({
    required this.controller,
    required this.muted,
    required this.busy,
    required this.micMode,
    required this.mood,
    required this.thoughtId,
    required this.thoughtText,
    required this.thoughtTyping,
    required this.showThought,
    required this.messageCount,
    required this.messagesOpen,
    required this.onToggleMessages,
    required this.onToggleMute,
    required this.onToggleMic,
    required this.onSend,
    super.key,
  });

  final TextEditingController controller;
  final bool muted;
  final bool busy;
  final MicMode micMode;
  final RobotMood mood;

  /// What the robot says (the teacher's latest message).
  final String? thoughtId;
  final String? thoughtText;
  final bool thoughtTyping;

  /// Hidden while the conversation sheet is open (the same words are in it).
  final bool showThought;

  final int messageCount;
  final bool messagesOpen;
  final VoidCallback onToggleMessages;
  final VoidCallback onToggleMute;
  final VoidCallback onToggleMic;
  final Future<void> Function(String message) onSend;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final robotH = robotHeightFor(MediaQuery.sizeOf(context));
    const overlap = 10.0;

    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(AimSpacing.space12, 0, AimSpacing.space12, 0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // The robot, with its thought bubble beside its head.
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Padding(padding: const EdgeInsetsDirectional.only(start: 4), child: AimRobot(mood: mood, height: robotH)),
              const SizedBox(width: 34),
              Expanded(
                child: Padding(
                  // The bubble's bottom edge sits at about the robot's head height and it grows upward.
                  padding: EdgeInsets.only(bottom: robotH * 0.5),
                  child: Align(
                    alignment: AlignmentDirectional.bottomStart,
                    child: showThought
                        ? RobotThought(messageId: thoughtId, text: thoughtText, typing: thoughtTyping)
                        : const SizedBox.shrink(),
                  ),
                ),
              ),
            ],
          ),
          // The box is drawn over the robot's bottom edge, so the robot sits on it.
          Transform.translate(
            offset: const Offset(0, -overlap),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _ComposerBox(
                  controller: controller,
                  muted: muted,
                  busy: busy,
                  micMode: micMode,
                  onToggleMute: onToggleMute,
                  onToggleMic: onToggleMic,
                  onSend: onSend,
                ),
                const SizedBox(height: AimSpacing.space8),
                _MessagesButton(
                  label: messagesOpen ? l10n.voiceLiveHideMessages : l10n.voiceLiveMessagesCount(messageCount),
                  open: messagesOpen,
                  onTap: onToggleMessages,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ComposerBox extends StatelessWidget {
  const _ComposerBox({
    required this.controller,
    required this.muted,
    required this.busy,
    required this.micMode,
    required this.onToggleMute,
    required this.onToggleMic,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool muted;
  final bool busy;
  final MicMode micMode;
  final VoidCallback onToggleMute;
  final VoidCallback onToggleMic;
  final Future<void> Function(String message) onSend;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: AimColors.neutral0,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x22000000), blurRadius: 14, offset: Offset(0, 4))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Your microphone.
          switch (micMode) {
            MicMode.live || MicMode.hearing => _SquareButton(
                icon: Icons.mic_rounded,
                tooltip: l10n.voiceLiveMicMute,
                style: _ButtonStyle.filled,
                ring: micMode == MicMode.hearing,
                onTap: onToggleMic,
              ),
            MicMode.muted => _SquareButton(
                icon: Icons.mic_off_rounded,
                tooltip: l10n.voiceLiveMicOn,
                style: _ButtonStyle.soft,
                onTap: onToggleMic,
              ),
            MicMode.off => _SquareButton(
                icon: Icons.mic_none_rounded,
                tooltip: l10n.voiceLiveMicStart,
                style: _ButtonStyle.filled,
                onTap: onToggleMic,
              ),
          },
          const SizedBox(width: 6),
          // The teacher's voice.
          _SquareButton(
            icon: muted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
            tooltip: muted ? l10n.voiceLiveUnmute : l10n.voiceLiveMute,
            style: muted ? _ButtonStyle.soft : _ButtonStyle.outlined,
            onTap: onToggleMute,
          ),
          const SizedBox(width: 4),
          Expanded(
            child: TextField(
              controller: controller,
              enabled: !busy,
              minLines: 1,
              maxLines: 4,
              textInputAction: TextInputAction.send,
              onSubmitted: (v) => onSend(v),
              style: const TextStyle(color: AimColors.neutral900, fontSize: 16),
              cursorColor: AimColors.primary600,
              decoration: InputDecoration(
                isDense: true,
                hintText: l10n.voiceLiveComposerHint,
                hintStyle: const TextStyle(color: AimColors.neutral500, fontSize: 15),
                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 11),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                disabledBorder: InputBorder.none,
              ),
            ),
          ),
          ValueListenableBuilder<TextEditingValue>(
            valueListenable: controller,
            builder: (context, value, _) {
              final hasText = value.text.trim().isNotEmpty;
              return _SquareButton(
                icon: Icons.arrow_upward_rounded,
                tooltip: l10n.voiceLiveSend,
                style: hasText ? _ButtonStyle.filled : _ButtonStyle.soft,
                onTap: busy || !hasText ? null : () => onSend(controller.text),
              );
            },
          ),
        ],
      ),
    );
  }
}

enum _ButtonStyle { filled, soft, outlined }

class _SquareButton extends StatelessWidget {
  const _SquareButton({
    required this.icon,
    required this.tooltip,
    required this.style,
    required this.onTap,
    this.ring = false,
  });

  final IconData icon;
  final String tooltip;
  final _ButtonStyle style;
  final VoidCallback? onTap;
  final bool ring;

  @override
  Widget build(BuildContext context) {
    final filled = style == _ButtonStyle.filled;
    final background = filled ? AimColors.primary600 : (style == _ButtonStyle.soft ? AimColors.neutral100 : Colors.transparent);
    final foreground = filled ? AimColors.neutral0 : AimColors.neutral700;
    return Semantics(
      button: true,
      enabled: onTap != null,
      label: tooltip,
      child: Tooltip(
        message: tooltip,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(12),
              border: style == _ButtonStyle.outlined ? Border.all(color: AimColors.neutral300) : null,
              boxShadow: ring ? [BoxShadow(color: AimColors.primary600.withValues(alpha: 0.3), spreadRadius: 4)] : null,
            ),
            child: Icon(icon, size: 21, color: onTap == null && !filled ? AimColors.neutral400 : foreground),
          ),
        ),
      ),
    );
  }
}

class _MessagesButton extends StatelessWidget {
  const _MessagesButton({required this.label, required this.open, required this.onTap});

  final String label;
  final bool open;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        borderRadius: AimRadius.borderPill,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AimColors.neutral0.withValues(alpha: 0.2),
            border: Border.all(color: AimColors.neutral0.withValues(alpha: 0.32)),
            borderRadius: AimRadius.borderPill,
          ),
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 16, vertical: 7),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                AnimatedRotation(
                  turns: open ? 0.5 : 0,
                  duration: const Duration(milliseconds: 250),
                  child: const Icon(Icons.keyboard_arrow_up_rounded, size: 20, color: AimColors.neutral0),
                ),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: AimTextStyles.caption.copyWith(color: AimColors.neutral0, fontWeight: AimFontWeights.semibold, fontSize: 14),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
