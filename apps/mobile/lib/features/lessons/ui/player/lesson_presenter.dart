// A student character standing next to a speech bubble. On a phone the character stands above the bubble; on wide
// screens (tablets) beside it. The artwork is mirrored when needed so the character always faces its bubble,
// in both left-to-right and right-to-left layouts.

import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

import 'student_characters.dart';

class LessonPresenter extends StatelessWidget {
  const LessonPresenter({
    required this.guide,
    required this.child,
    this.large = false,
    super.key,
  });

  final StudentCharacter guide;

  /// What the character says.
  final Widget child;

  /// The hello and finish cards stand the character a little taller.
  final bool large;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 560;
        final height = large ? (wide ? 300.0 : 200.0) : (wide ? 240.0 : 150.0);
        final character = CharacterImage(
          character: guide,
          height: height,
        );
        final bubble = _SpeechBubble(tailOnSide: wide, child: child);
        if (wide) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              character,
              const SizedBox(width: 24),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 28),
                  child: bubble,
                ),
              ),
            ],
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Align(alignment: AlignmentDirectional.centerStart, child: character),
            const SizedBox(height: 12),
            bubble,
          ],
        );
      },
    );
  }
}

/// A full-body character mirrored to look toward the start or end side of the current text direction.
class CharacterImage extends StatelessWidget {
  const CharacterImage({
    required this.character,
    required this.height,
    this.lookTowardRight,
    super.key,
  });

  final StudentCharacter character;
  final double height;

  /// Physical direction to look (used by the dialogue stage). When null the character looks toward the end side of
  /// the text direction, i.e. toward the speech bubble it stands beside.
  final bool? lookTowardRight;

  @override
  Widget build(BuildContext context) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final wantRight = lookTowardRight ?? !rtl;
    final facesRight = character.faces == CharacterFacing.right;
    return Transform.flip(
      flipX: facesRight != wantRight,
      child: Image.asset(
        character.bodyAsset,
        height: height,
        fit: BoxFit.contain,
        excludeFromSemantics: true,
        filterQuality: FilterQuality.medium,
      ),
    );
  }
}

class _SpeechBubble extends StatelessWidget {
  const _SpeechBubble({required this.child, required this.tailOnSide});

  final Widget child;
  final bool tailOnSide;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final side = BorderSide(color: surfaces.borderStrong, width: 2);

    // A 16px square turned 45 degrees: two of its edges draw the tail. Rotating the other way in RTL keeps it
    // pointing at the character, which then stands on the right.
    final tail = Transform.rotate(
      angle: rtl ? -math.pi / 4 : math.pi / 4,
      child: Container(
        width: 16,
        height: 16,
        decoration: BoxDecoration(
          color: surfaces.surface,
          border: BorderDirectional(
            start: side,
            top: tailOnSide ? BorderSide.none : side,
            bottom: tailOnSide ? side : BorderSide.none,
          ),
        ),
      ),
    );

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: surfaces.borderStrong, width: 2),
          ),
          child: child,
        ),
        if (tailOnSide)
          PositionedDirectional(start: -9, bottom: 44, child: tail)
        else
          PositionedDirectional(top: -9, start: 56, child: tail),
      ],
    );
  }
}
