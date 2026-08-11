// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lesson detail"
//   docs/design/ui-for-all-system-mobile/screenshots/light/09-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/09-screen.png
// Endpoint: GET /curriculum/lesson-assets?lessonId=:lessonId&status=published
//   (LessonDetail = Lesson + LessonAsset list; see lessons_provider.dart)
// Widgets: AIMTopAppBar (disabled bookmark action), AIMCard/LessonStepTile,
//   LessonContentRenderer (in modal bottom sheet), AIMButton, AIMBadge
//
// Phase 6 — P6-079
// LessonDetailPage — lesson overview screen.
//
// Displays a gradient hero (description + duration/steps/XP pills), a
// "What's inside" step list (one row per published asset), and a
// "Start practice" CTA that opens the AI Teacher chat with this lesson as
// context. Tapping a step row opens a modal bottom sheet that renders that
// asset's full content via LessonContentRenderer — this screen itself
// remains an overview, not the content viewer.
//
// Security rules:
// - lessonId is always the backend-supplied value from LessonModel; never
//   from user input or local computation.
// - Flutter never computes type, status, order, or asset values; duration
//   total and step count are simple sums/counts of backend-supplied fields,
//   never inferred mastery/AIM values.
// - Bearer token from authFlowProvider; never stored here.
// - xpValue is backend-supplied and display-only — never read by the AIM
//   Engine, mastery scoring, or any local computation here.
// - The AI Teacher chat session itself is created entirely backend-side;
//   Flutter only navigates with a contextRef/lessonTitle hint.
// - No secrets here.
//
// RTL/Arabic rules:
// - Directionality-aware Column/ListView throughout.
// - AIMTopAppBar handles back-arrow mirroring internally.
// - EdgeInsets.symmetric mirrors correctly under RTL.

import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lessons_entities.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/lessons_widgets.dart';

/// Lesson detail screen MVP.
///
/// Expects route arguments: `{'lessonId': String, 'lessonTitle': String}`.
/// [lessonId] must be backend-supplied; never constructed from user input.
class LessonDetailPage extends ConsumerStatefulWidget {
  const LessonDetailPage({
    required this.lessonId,
    required this.lessonTitle,
    super.key,
  });

  /// Backend-supplied lesson UUID from the prior LessonModel response.
  final String lessonId;

  /// Display title for the AppBar (from the prior LessonModel).
  final String lessonTitle;

  @override
  ConsumerState<LessonDetailPage> createState() => _LessonDetailPageState();
}

class _LessonDetailPageState extends ConsumerState<LessonDetailPage> {
  // Locked-by-default: the "Practice questions" CTA only unlocks once the
  // backend confirms this lesson is complete (lesson_progress.completed —
  // set by LessonTeachingStageService when the AI Teacher/Voice Teacher
  // finishes teaching it). Starts false so the button never briefly shows
  // enabled before the real state is known.
  bool _practiceUnlocked = false;
  bool _practiceCheckStarted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(lessonDetailProvider.notifier).load(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  /// Reads this lesson's real per-student completed flag (backend-computed,
  /// StudentLessonSummary.completed from GET /student/lessons?chapterId=)
  /// to decide whether "Practice questions" unlocks. Fetched via the same
  /// chapter-lessons endpoint the chapter/lesson-list screens already use —
  /// no new endpoint needed. Failure leaves the CTA locked rather than
  /// failing the whole page.
  Future<void> _checkPracticeUnlock(LessonDetail detail) async {
    if (_practiceCheckStarted) return;
    _practiceCheckStarted = true;

    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    try {
      final lessons = await ref.read(lessonsRepositoryProvider).getLessonsWithProgress(
            bearerToken: token,
            chapterId: detail.lesson.chapterId,
          );
      LessonProgress? match;
      for (final l in lessons) {
        if (l.id == detail.lesson.id) {
          match = l;
          break;
        }
      }
      if (mounted && match != null) {
        setState(() => _practiceUnlocked = match!.completed);
      }
    } catch (_) {
      // Leave _practiceUnlocked at its current (locked-by-default) value.
    }
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    // Re-check practice-unlock on pull-to-refresh too — the student may
    // have just finished the lesson with the AI/Voice Teacher.
    _practiceCheckStarted = false;
    await ref.read(lessonDetailProvider.notifier).refresh(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  Future<void> _markComplete(LessonDetail detail) async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    try {
      await ref.read(lessonsRepositoryProvider).markLessonComplete(
            bearerToken: token,
            lessonId: detail.lesson.id,
          );
      if (mounted) {
        setState(() => _practiceUnlocked = true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AimColors.success500,
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: AimColors.neutral0),
                SizedBox(width: 8),
                Expanded(
                  child: Text('Lesson marked as completed! 🌟'),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AimColors.error500,
            content: Text('Could not mark lesson complete: $e'),
          ),
        );
      }
    }
  }

  void _startPractice(LessonDetail detail) {
    context.push(
      AppRoutePaths.aiTeacherChat,
      extra: {
        'contextRef': 'lesson:${detail.lesson.id}',
        'lessonTitle': detail.lesson.title,
        'contextLabel': AppLocalizations.of(context).lessonsPracticeContextLabel,
      },
    );
  }

  // P21-017: the same contextRef used for the chat entry point above — the
  // backend's get-or-create-by-(studentId, contextRef) path (P21-007)
  // resolves both to the identical ai_chat_sessions row, so a lesson's chat
  // and voice turns share one conversation regardless of which entry point
  // the student taps first.
  // AIM pipeline live wiring: real question practice through a learning
  // session (POST /sessions/start -> question delivery -> attempts, which
  // trigger the AIM pipeline). Added alongside — never replacing — the AI
  // Teacher chat and voice entry points above.
  void _startQuestionPractice(LessonDetail detail) {
    context.push(
      AppRoutePaths.practiceSession,
      extra: {
        'lessonId': detail.lesson.id,
        'lessonTitle': detail.lesson.title,
      },
    );
  }

  void _startVoicePractice(LessonDetail detail) {
    context.push(
      AppRoutePaths.voiceTeacher,
      extra: {
        'contextRef': 'lesson:${detail.lesson.id}',
        'lessonTitle': detail.lesson.title,
      },
    );
  }

  void _openStep(LessonAsset asset, int stepNumber) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _LessonStepSheet(
        asset: asset,
        stepNumber: stepNumber,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(lessonDetailProvider);

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.lessonsLessonAppBarTitle,
        onBack: () {
          if (context.canPop()) context.pop();
        },
        actions: [
          AIMIconButton(
            icon: const Icon(Icons.bookmark_border_rounded),
            semanticLabel: l10n.lessonsSaveLessonComingSoonSemantic,
            onPressed: null,
          ),
        ],
      ),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.lessonsLoadingLessonSemantic,
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => Builder(
            builder: (_) {
              // Fire-and-forget: triggers once per successful load (the
              // widget rebuilds on setState, not on this call itself, so
              // this doesn't re-fetch every frame).
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) unawaited(_checkPracticeUnlock(data));
              });
              return _LessonDetailContent(
                detail: data,
                practiceUnlocked: _practiceUnlocked,
                onRefresh: _refresh,
                onMarkComplete: () => _markComplete(data),
                onStartPractice: () => _startPractice(data),
                onStartQuestionPractice: () => _startQuestionPractice(data),
                onStartVoicePractice: () => _startVoicePractice(data),
                onOpenStep: _openStep,
              );
            },
          ),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: l10n.lessonsLoadingLessonSemantic,
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _LessonDetailContent extends StatelessWidget {
  const _LessonDetailContent({
    required this.detail,
    required this.practiceUnlocked,
    required this.onRefresh,
    required this.onMarkComplete,
    required this.onStartPractice,
    required this.onStartQuestionPractice,
    required this.onStartVoicePractice,
    required this.onOpenStep,
  });

  final LessonDetail detail;
  final bool practiceUnlocked;
  final Future<void> Function() onRefresh;
  final VoidCallback onMarkComplete;
  final VoidCallback onStartPractice;
  final VoidCallback onStartQuestionPractice;
  final VoidCallback onStartVoicePractice;
  final void Function(LessonAsset asset, int stepNumber) onOpenStep;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              children: [
                _LessonHero(detail: detail, isCompleted: practiceUnlocked),
                const SizedBox(height: 20),

                // Section Header: What's inside
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.lessonsWhatsInsideTitle,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    Text(
                      l10n.lessonsStepsCountLabel(detail.assets.length),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: surfaces.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (detail.hasNoContent)
                  AIMEmptyState(
                    icon: const Icon(Icons.play_lesson_outlined),
                    title: l10n.lessonsNoContentTitle,
                    subtitle: l10n.lessonsNoContentSubtitle,
                  )
                else
                  ...detail.assets.asMap().entries.map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: LessonStepTile(
                            asset: entry.value,
                            stepNumber: entry.key + 1,
                            onTap: () => onOpenStep(entry.value, entry.key + 1),
                          ),
                        ),
                      ),

                const SizedBox(height: 16),

                // Key Vocabulary & Phrases Preview Card
                _KeyPhrasesCard(detail: detail),
                const SizedBox(height: 20),

                if (!practiceUnlocked) ...[
                  AIMGradientButton(
                    label: 'Mark Lesson as Completed ✨',
                    fullWidth: true,
                    onPressed: onMarkComplete,
                  ),
                  const SizedBox(height: 16),
                ],

                if (practiceUnlocked) ...[
                  const SizedBox(height: 16),
                  // Post-Lesson Mastered Section matching prototype
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: surfaces.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: surfaces.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Lesson Mastered! 🌟',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: surfaces.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Reinforce your knowledge or practice with quick exercises.',
                          style: TextStyle(
                            fontSize: 12,
                            color: surfaces.textSecondary,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Practice Now Card
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: onStartQuestionPractice,
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEEF2FF),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFC7D2FE)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.bolt_rounded, color: Colors.white, size: 24),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            const Text(
                                              'Practice Now',
                                              style: TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w800,
                                                color: Color(0xFF4F46E5),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF4F46E5),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              child: const Text(
                                                'QUIZ',
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w900,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 2),
                                        const Text(
                                          'Test your comprehension with quick interactive exercises.',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: Color(0xFF4338CA),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 10),

                        // Ask AI Tutor Card
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: onStartPractice,
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: surfaces.surfaceSunken,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: surfaces.border),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF3E8FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.auto_awesome_rounded, color: Color(0xFF9333EA), size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Ask AI Tutor',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: surfaces.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Chat with your AI tutor to clarify rules or ask questions.',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: surfaces.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),

        // Bottom Primary CTA Bar matching prototype
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4F46E5).withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onStartVoicePractice,
                  borderRadius: BorderRadius.circular(20),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.mic_rounded, color: Colors.white, size: 22),
                        const SizedBox(width: 10),
                        Text(
                          practiceUnlocked ? 'Re-learn with Live AI Voice' : 'Start Learning Now',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _KeyPhrasesCard extends StatefulWidget {
  const _KeyPhrasesCard({required this.detail});

  final LessonDetail detail;

  @override
  State<_KeyPhrasesCard> createState() => _KeyPhrasesCardState();
}

class _KeyPhrasesCardState extends State<_KeyPhrasesCard> {
  int? _playingIndex;
  AudioPlayer? _player;

  List<({String phrase, String translation})> get _phrases {
    final title = widget.detail.lesson.title.toLowerCase();

    // 1. Dynamic phrases based on lesson topic
    if (title.contains('alphabet') || title.contains('letter') || title.contains('sound')) {
      return const [
        (
          phrase: 'A, B, C, D, E, F, G',
          translation: 'Letter recognition and phonetic sounds.'
        ),
        (
          phrase: 'Apple, Ball, Cat, Dog',
          translation: 'Basic vocabulary starting sounds.'
        ),
        (
          phrase: 'Can you spell your name, please?',
          translation: 'Asking for spelling in English.'
        ),
      ];
    }

    if (title.contains('vowel') || title.contains('phonics')) {
      return const [
        (
          phrase: 'Cat, Bed, Sit, Hot, Cup',
          translation: 'Five short vowel sounds (a, e, i, o, u).'
        ),
        (
          phrase: 'A red pen is on the desk.',
          translation: 'Short vowel sentence practice.'
        ),
        (
          phrase: 'The big dog ran in the sun.',
          translation: 'Reading short vowel words.'
        ),
      ];
    }

    if (title.contains('consonant') || title.contains('blend') || title.contains('pair')) {
      return const [
        (
          phrase: 'Ship, Shop, Chip, Chop',
          translation: 'Distinguishing Sh vs Ch consonant sounds.'
        ),
        (
          phrase: 'Think, Thank, This, That',
          translation: 'Th voiced and voiceless sounds.'
        ),
        (
          phrase: 'Blue, Green, Play, Stop',
          translation: 'Consonant blend pronunciations.'
        ),
      ];
    }

    if (title.contains('greeting') || title.contains('salutation') || title.contains('intro')) {
      return const [
        (
          phrase: 'Hello, how are you today?',
          translation: 'Common polite English greeting.'
        ),
        (
          phrase: 'Nice to meet you, my name is Alex.',
          translation: 'Introducing yourself to others.'
        ),
        (
          phrase: 'Have a great day! See you later.',
          translation: 'Polite farewells and goodbyes.'
        ),
      ];
    }

    if (title.contains('food') || title.contains('drink') || title.contains('cafe') || title.contains('order')) {
      return const [
        (
          phrase: 'Could I get a cup of coffee, please?',
          translation: 'Polite ordering at a cafe or restaurant.'
        ),
        (
          phrase: 'Could you bring us the bill, please?',
          translation: 'Asking the server for the check.'
        ),
        (
          phrase: 'What do you recommend today?',
          translation: 'Asking for today\'s specials.'
        ),
      ];
    }

    // Default fallback matching lesson title
    return [
      (
        phrase: widget.detail.lesson.title,
        translation: widget.detail.lesson.description.isNotEmpty
            ? widget.detail.lesson.description
            : 'Key phrase and usage for this lesson.',
      ),
      const (
        phrase: 'Listen carefully and repeat after the teacher.',
        translation: 'Practice active listening and speech.',
      ),
    ];
  }

  @override
  void dispose() {
    _player?.dispose();
    super.dispose();
  }

  Future<void> _play(int index) async {
    final phrases = _phrases;
    if (index >= phrases.length) return;

    if (_playingIndex == index) {
      await _player?.stop();
      if (mounted) setState(() => _playingIndex = null);
      return;
    }

    setState(() => _playingIndex = index);
    try {
      _player ??= AudioPlayer();
      await _player!.stop();
      final phraseText = phrases[index].phrase;
      final ttsUrl =
          'https://translate.google.com/translate_tts?ie=UTF-8&q=${Uri.encodeComponent(phraseText)}&tl=en&client=tw-ob';
      await _player!.play(UrlSource(ttsUrl));
      _player!.onPlayerComplete.first.then((_) {
        if (mounted && _playingIndex == index) {
          setState(() => _playingIndex = null);
        }
      });
    } catch (_) {
      if (mounted && _playingIndex == index) {
        setState(() => _playingIndex = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final phrases = _phrases;
    final surfaces = aimSurfacesOf(context);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEEF2FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.menu_book_rounded, color: Color(0xFF4F46E5), size: 18),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Key Vocabulary & Phrases',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textPrimary,
                    ),
                  ),
                ],
              ),
              Text(
                'TAP 🔊 TO LISTEN',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: surfaces.textMuted,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          for (int i = 0; i < phrases.length; i++) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: surfaces.border),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          phrases[i].phrase,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF4F46E5),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          phrases[i].translation,
                          style: TextStyle(
                            fontSize: 11,
                            color: surfaces.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _play(i),
                    icon: Icon(
                      _playingIndex == i ? Icons.volume_up_rounded : Icons.volume_down_rounded,
                      color: _playingIndex == i ? Colors.white : const Color(0xFF4F46E5),
                      size: 18,
                    ),
                    style: IconButton.styleFrom(
                      backgroundColor: _playingIndex == i
                          ? const Color(0xFF4F46E5)
                          : const Color(0xFFEEF2FF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                ],
              ),
            ),
            if (i < _phrases.length - 1) const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _LessonHero extends StatelessWidget {
  const _LessonHero({required this.detail, this.isCompleted = false});

  final LessonDetail detail;
  final bool isCompleted;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final totalSeconds = detail.assets.fold<int>(
      0,
      (sum, asset) => sum + (asset.durationSeconds ?? 0),
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF7C3AED)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4F46E5).withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _HeroPill(text: l10n.lessonsLessonNumberPill(detail.lesson.sortOrder)),
              if (isCompleted)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF6EE7B7).withValues(alpha: 0.4)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_rounded, color: Color(0xFF6EE7B7), size: 14),
                      SizedBox(width: 4),
                      Text(
                        'Completed',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF6EE7B7),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            detail.lesson.title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.4,
            ),
          ),
          if (detail.lesson.description.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              detail.lesson.description,
              style: TextStyle(
                fontSize: 13,
                color: Colors.white.withValues(alpha: 0.9),
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 18),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (totalSeconds > 0)
                _HeroPill(text: _formatMinutes(l10n, totalSeconds)),
              _HeroPill(text: l10n.lessonsBlocksCountLabel(detail.assets.length)),
              if (detail.lesson.xpValue > 0)
                AIMBadge(
                  tone: AIMBadgeTone.success,
                  variant: AIMBadgeVariant.solid,
                  pill: true,
                  child: Text(l10n.lessonsXpBadge(detail.lesson.xpValue)),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatMinutes(AppLocalizations l10n, int seconds) {
    final minutes = (seconds / 60).ceil();
    return l10n.lessonsMinutesLabel(minutes);
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space12,
        vertical: AimSpacing.space4,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: AimRadius.borderPill,
      ),
      child: Text(
        text,
        style: AimTextStyles.bodySm.copyWith(color: Colors.white),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Step content bottom sheet — wraps the already-tested LessonContentRenderer
// ---------------------------------------------------------------------------

/// Modal bottom sheet shown when a [LessonStepTile] row is tapped.
///
/// Renders the tapped step's full content via [LessonContentRenderer] (image
/// preview, audio/video info card, etc.) — all values are backend-supplied
/// verbatim; this sheet only adds a drag handle, title, and close affordance
/// around the existing renderer. Styling mirrors [AIMNotificationsSheet],
/// the codebase's existing showModalBottomSheet convention.
class _LessonStepSheet extends StatelessWidget {
  const _LessonStepSheet({
    required this.asset,
    required this.stepNumber,
  });

  final LessonAsset asset;
  final int stepNumber;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final l10n = AppLocalizations.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(AimRadius.x2l),
          topEnd: Radius.circular(AimRadius.x2l),
        ),
        boxShadow: shadows.sheet,
      ),
      child: SafeArea(
        top: false,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * 0.85,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag handle
              Padding(
                padding: const EdgeInsets.only(top: AimSpacing.space12),
                child: Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: surfaces.border,
                      borderRadius: AimRadius.borderPill,
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  AimSpacing.screenPaddingMobile,
                  AimSpacing.space12,
                  AimSpacing.space8,
                  AimSpacing.space8,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        l10n.lessonsStepTitleLabel(stepNumber),
                        style: AimTextStyles.h3.copyWith(
                          color: surfaces.textPrimary,
                        ),
                      ),
                    ),
                    AIMIconButton(
                      icon: const Icon(Icons.close_rounded),
                      semanticLabel: l10n.commonClose,
                      onPressed: () => context.pop(),
                    ),
                  ],
                ),
              ),
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsetsDirectional.fromSTEB(
                    AimSpacing.screenPaddingMobile,
                    0,
                    AimSpacing.screenPaddingMobile,
                    AimSpacing.sectionGap,
                  ),
                  child: LessonContentRenderer(asset: asset),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
