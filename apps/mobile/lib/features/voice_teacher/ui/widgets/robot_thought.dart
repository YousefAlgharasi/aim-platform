// RobotThought — what the robot is saying, as a thought bubble rising from the top-right of its head.
//
// The words are written out as they would be spoken. When the robot says something new, the new bubble pops up over
// the old one while the old one shrinks and fades behind it.

import 'dart:async';

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/features/lessons/ui/widgets/light_markdown.dart';

class RobotThought extends StatelessWidget {
  const RobotThought({required this.messageId, required this.text, required this.typing, super.key});

  /// Identifies the message: a new id means a new bubble.
  final String? messageId;
  final String? text;

  /// Write the words out one by one (false shows them at once, e.g. when the conversation was just reopened).
  final bool typing;

  @override
  Widget build(BuildContext context) {
    final words = text;
    final id = messageId;
    final origin = Directionality.of(context) == TextDirection.rtl ? Alignment.bottomRight : Alignment.bottomLeft;
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 380),
      switchInCurve: Curves.easeOutBack,
      switchOutCurve: Curves.easeIn,
      layoutBuilder: (current, previous) => Stack(
        alignment: AlignmentDirectional.bottomStart,
        clipBehavior: Clip.none,
        children: [...previous, if (current != null) current],
      ),
      transitionBuilder: (child, animation) => FadeTransition(
        opacity: animation,
        child: ScaleTransition(scale: Tween<double>(begin: 0.9, end: 1).animate(animation), alignment: origin, child: child),
      ),
      child: words == null || words.isEmpty || id == null
          ? const SizedBox.shrink(key: ValueKey('none'))
          : _Bubble(key: ValueKey(id), text: words, typing: typing),
    );
  }
}

class _Bubble extends StatefulWidget {
  const _Bubble({required this.text, required this.typing, super.key});

  final String text;
  final bool typing;

  @override
  State<_Bubble> createState() => _BubbleState();
}

class _BubbleState extends State<_Bubble> {
  final ScrollController _scroll = ScrollController();
  Timer? _timer;
  int _shown = 0;

  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    final total = widget.text.characters.length;
    if (!widget.typing || (MediaQuery.maybeOf(context)?.disableAnimations ?? false)) {
      _shown = total;
      return;
    }
    // About 45 characters a second, but never longer than about 8 seconds for a long message.
    final perTick = (total / (8 * 33)).ceil();
    final step = perTick > 2 ? perTick : 2;
    _timer = Timer.periodic(const Duration(milliseconds: 30), (timer) {
      if (!mounted) return;
      setState(() => _shown = (_shown + step).clamp(0, total));
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
      });
      if (_shown >= total) timer.cancel();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scroll.dispose();
    super.dispose();
  }

  /// The words written so far, with any bold marker that is still open closed again so it does not flicker.
  String get _visible {
    final shown = widget.text.characters.take(_shown).toString();
    final opens = '**'.allMatches(shown).length;
    return opens.isOdd ? '$shown**' : shown;
  }

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.sizeOf(context).height * 0.3;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          constraints: BoxConstraints(maxHeight: maxHeight),
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 14),
          decoration: BoxDecoration(
            color: AimColors.neutral0,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AimColors.neutral0.withValues(alpha: 0.6)),
            boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 22, offset: Offset(0, 8))],
          ),
          child: SingleChildScrollView(
            controller: _scroll,
            child: LightMarkdown(
              text: _visible,
              style: const TextStyle(fontSize: 16, height: 1.45, color: AimColors.neutral900),
            ),
          ),
        ),
        // Small circles trailing down toward the robot's head, like a thought.
        PositionedDirectional(start: -10, bottom: -8, child: _dot(14)),
        PositionedDirectional(start: -22, bottom: -19, child: _dot(10)),
        PositionedDirectional(start: -31, bottom: -28, child: _dot(6)),
      ],
    );
  }

  Widget _dot(double size) => Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(
          color: AimColors.neutral0,
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: Color(0x22000000), blurRadius: 4)],
        ),
      );
}
