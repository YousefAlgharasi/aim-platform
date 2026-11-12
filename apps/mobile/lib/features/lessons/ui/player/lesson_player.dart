// LessonPlayer — the lesson as a short guided walk, one card at a time (like the mainstream learning apps): a student
// character says hello, explains the lesson, the lesson's own steps follow, and the last card starts practice.
// One progress bar on top; the bottom bar always holds the next action. All content comes from the backend.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import 'lesson_dialogue.dart';
import 'lesson_slide_views.dart';
import 'lesson_start_view.dart';
import 'lesson_slides.dart';
import 'student_characters.dart';

class LessonPlayer extends StatefulWidget {
  const LessonPlayer({
    required this.detail,
    required this.completed,
    required this.onBack,
    required this.onStartLive,
    required this.onAskTutor,
    required this.onStartQuestionPractice,
    required this.onStartVoicePractice,
    super.key,
  });

  final LessonDetail detail;

  /// True when the student already completed this lesson (backend flag).
  final bool completed;
  final VoidCallback onBack;

  /// Starts the live voice lesson with the AI teacher (the main way to learn the lesson).
  final VoidCallback onStartLive;
  final VoidCallback onAskTutor;
  final VoidCallback onStartQuestionPractice;
  final VoidCallback onStartVoicePractice;

  @override
  State<LessonPlayer> createState() => _LessonPlayerState();
}

class _LessonPlayerState extends State<LessonPlayer> {
  int _index = 0;

  /// Opening a lesson shows the two ways to learn it first; true once the student chose to read it with the character.
  bool _reading = false;
  List<LessonSlide>? _slides;
  String? _slidesFor;

  List<LessonSlide> _buildSlides(AppLocalizations l10n) {
    // Rebuilt only when the lesson or the UI language changes, so the current card survives a rebuild.
    final key = '${widget.detail.lesson.id}|${l10n.localeName}|${widget.detail.assets.length}';
    if (_slides == null || _slidesFor != key) {
      _slidesFor = key;
      _slides = buildLessonSlides(
        description: widget.detail.lesson.description,
        explanation: widget.detail.lesson.explanation,
        assets: widget.detail.assets,
        keyPointsLabel: l10n.lessonPlayerKeyPoints,
        recapLabel: l10n.lessonPlayerRecap,
        mistakesLabel: l10n.lessonPlayerMistakes,
      );
      if (_index >= _slides!.length) _index = _slides!.length - 1;
    }
    return _slides!;
  }

  void _go(int to, int last) {
    final next = to.clamp(0, last);
    if (next == _index) return;
    setState(() => _index = next);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final slides = _buildSlides(l10n);
    final last = slides.length - 1;
    final slide = slides[_index];
    final guide = pickPresenter(widget.detail.lesson.id);
    if (!_reading) {
      return LessonStartView(
        title: widget.detail.lesson.title,
        guide: guide,
        completed: widget.completed,
        onBack: widget.onBack,
        onStartLive: widget.onStartLive,
        onRead: () => setState(() => _reading = true),
      );
    }
    final isLast = _index >= last;
    final centered = slide is IntroSlide || slide is FinishSlide;

    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 20, 0),
            child: Row(
              children: [
                IconButton(
                  // On the first card the arrow returns to the start screen; elsewhere it leaves the lesson.
                  onPressed: _index == 0 ? () => setState(() => _reading = false) : widget.onBack,
                  tooltip: l10n.commonBack,
                  icon: const Icon(Icons.arrow_back_rounded),
                  color: surfaces.textSecondary,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Semantics(
                    label: l10n.lessonPlayerProgress,
                    value: '${((_index / last) * 100).round()}%',
                    child: _ProgressBar(fraction: last == 0 ? 1 : _index / last),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: AnimatedSwitcher(
              duration: MediaQuery.disableAnimationsOf(context)
                  ? Duration.zero
                  : const Duration(milliseconds: 220),
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0, 0.03),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                ),
              ),
              child: LayoutBuilder(
                key: ValueKey<int>(_index),
                builder: (context, constraints) => SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight - 40),
                    child: Column(
                      mainAxisAlignment:
                          centered ? MainAxisAlignment.center : MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [_slideView(slide, guide)],
                    ),
                  ),
                ),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
            decoration: BoxDecoration(
              color: surfaces.background,
              border: Border(top: BorderSide(color: surfaces.border, width: 2)),
            ),
            child: Row(
              children: [
                if (_index > 0) ...[
                  SizedBox(
                    width: 56,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: () => _go(_index - 1, last),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        side: BorderSide(color: surfaces.borderStrong, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      ),
                      child: Icon(
                        Icons.arrow_back_rounded,
                        semanticLabel: l10n.lessonPlayerPrevious,
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: isLast
                      ? AIMGradientButton(
                          label: widget.completed
                              ? l10n.lessonsPracticeAgainButton
                              : l10n.lessonsStartPracticeButton,
                          icon: const Icon(Icons.bolt_rounded, color: Colors.white, size: 22),
                          fullWidth: true,
                          onPressed: widget.onStartQuestionPractice,
                        )
                      : AIMGradientButton(
                          label: slide is IntroSlide
                              ? l10n.lessonPlayerLetsGo
                              : l10n.commonContinue,
                          fullWidth: true,
                          onPressed: () => _go(_index + 1, last),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _slideView(LessonSlide slide, StudentCharacter guide) {
    return switch (slide) {
      IntroSlide() => IntroSlideView(
          guide: guide,
          title: widget.detail.lesson.title,
          completed: widget.completed,
        ),
      SaySlide(:final title, :final body, :final examples) =>
        SaySlideView(guide: guide, title: title, body: body, examples: examples),
      PointsSlide(:final title, :final points) =>
        PointsSlideView(guide: guide, title: title, points: points),
      MistakesSlide(:final title, :final items) =>
        MistakesSlideView(guide: guide, title: title, items: items),
      AssetSlide(:final asset) => AssetSlideView(asset: asset),
      FinishSlide() => FinishSlideView(
          guide: guide,
          completed: widget.completed,
          onAskTutor: widget.onAskTutor,
          onVoicePractice: widget.onStartVoicePractice,
        ),
    };
  }
}

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({required this.fraction});

  final double fraction;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final f = fraction.clamp(0.04, 1.0);
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 16,
        color: surfaces.surfaceSunken,
        alignment: AlignmentDirectional.centerStart,
        child: AnimatedFractionallySizedBox(
          duration: MediaQuery.disableAnimationsOf(context)
              ? Duration.zero
              : const Duration(milliseconds: 400),
          curve: Curves.easeOut,
          widthFactor: f,
          child: Container(
            decoration: BoxDecoration(
              color: AimColors.primary500,
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.fromLTRB(8, 4, 8, 0),
            alignment: Alignment.topCenter,
            child: Container(
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
