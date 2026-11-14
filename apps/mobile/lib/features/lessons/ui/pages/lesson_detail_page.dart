// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lesson detail"
//   docs/design/ui-for-all-system-mobile/screenshots/light/09-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/09-screen.png
// Endpoint: GET /curriculum/lesson-assets?lessonId=:lessonId&status=published
//   (LessonDetail = Lesson + LessonAsset list; see lessons_provider.dart)
// Widgets: AIMTopAppBar (disabled bookmark action), AIMCard/LessonStepTile,
//   LessonContentRenderer (in modal bottom sheet), AIMButton, AIMBadge
//
// Phase 6 — P6-079 (redesigned as a guided lesson player)
// LessonDetailPage — loads the lesson and shows it as a short guided walk, one card at a time (LessonPlayer): a
// student character says hello and offers the AI tutor, explains the lesson, the lesson's own steps follow, and the
// last card starts question practice (or voice / AI-tutor practice).
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/home_courses_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lessons_entities.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../player/lesson_player.dart';

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
  // The backend's per-student "completed" flag for this lesson. Practice itself is always available; this only
  // decides the wording ("Practice again", "Lesson mastered") and the Completed badge, so it starts as not completed.
  bool _completed = false;
  bool _practiceCheckStarted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  bool _idleLoadScheduled = false;

  /// Idle means "not asked yet" (e.g. the provider was recreated); ask
  /// instead of showing a skeleton nothing will ever replace.
  Widget _idleBody(String label) {
    if (!_idleLoadScheduled) {
      _idleLoadScheduled = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _idleLoadScheduled = false;
        if (mounted && ref.read(lessonDetailProvider) is AppAsyncIdle) _load();
      });
    }
    return AIMFullScreenLoading(semanticLabel: label);
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
        setState(() => _completed = match!.completed);
      }
    } catch (_) {
      // Leave _completed as it is (not completed).
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
  Future<void> _startQuestionPractice(LessonDetail detail) async {
    await context.push(
      AppRoutePaths.practiceSession,
      extra: {
        'lessonId': detail.lesson.id,
        'lessonTitle': detail.lesson.title,
      },
    );
    if (mounted) {
      _practiceCheckStarted = false;
      // Progress changed: re-read what depends on it in place. The screens
      // underneath keep showing their current data meanwhile (invalidating
      // their providers instead would reset them to an empty state that
      // nothing reloads, leaving them on a skeleton for good).
      final token = ref.read(authFlowProvider).accessToken;
      if (token != null && token.isNotEmpty) {
        unawaited(ref.read(chaptersProvider.notifier).refreshQuietly(bearerToken: token));
        unawaited(ref.read(lessonsListProvider.notifier).refreshQuietly(bearerToken: token));
        unawaited(ref.read(studentCoursesProvider.notifier).refreshQuietly(bearerToken: token));
      }
      ref.invalidate(homeCoursesProvider);
      await _checkPracticeUnlock(detail);
      await _refresh();
    }
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

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(lessonDetailProvider);
    void back() {
      if (context.canPop()) context.pop();
    }

    return Scaffold(
      // Once loaded, the player draws its own top bar (back arrow + progress).
      appBar: state is AppAsyncSuccess<LessonDetail>
          ? null
          : AIMTopAppBar(title: l10n.lessonsLessonAppBarTitle, onBack: back),
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
              return LessonPlayer(
                detail: data,
                completed: _completed,
                onBack: back,
                onStartLive: () => _startVoicePractice(data),
                onAskTutor: () => _startPractice(data),
                onStartQuestionPractice: () => _startQuestionPractice(data),
                onStartVoicePractice: () => _startVoicePractice(data),
              );
            },
          ),
        AppAsyncIdle() => _idleBody(l10n.lessonsLoadingLessonSemantic),
      },
    );
  }
}
