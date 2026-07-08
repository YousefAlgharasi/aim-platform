// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lessons" (lessonList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/08-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/08-screen.png
// Endpoint: GET /student/lessons?chapterId= (LessonProgressModel fields,
//   real per-student progress — see student-lessons.controller.ts)
// Widgets: AIMIconButton, AIMProgressBar, AIMFullScreenLoading,
//   AIMFullScreenError, AIMEmptyState, LessonListTile
//
// Phase 6 — P6-075
// LessonListPage — displays lessons for a backend-supplied chapter.
//
// Receives [chapterId], [chapterTitle], and (optionally) [chapterIndex]
// from route arguments (set by ChapterListPage). Loads via
// [lessonsListProvider.autoDispose] on first build. Tapping a lesson
// navigates to [AppRoutePaths.lessonDetail] with the backend-supplied
// lessonId and lessonTitle as route arguments.
//
// The chapter-level "N/M done" progress bar and each row's
// completed/current/upcoming indicator are driven by real, backend-computed
// fields on [LessonProgressModel] (completed, current) — GET
// /student/lessons?chapterId= joins the student's real lesson_progress rows
// server-side; Flutter never computes any of these.
//
// Security rules:
// - chapterId is always the backend-supplied value from ChapterProgressModel;
//   never from user input or local computation. chapterIndex is only used to
//   render the "CHAPTER N" eyebrow label — it is the chapter's position in
//   the previously-loaded, backend-ordered chapter list.
// - Flutter never computes status, sortOrder, or hierarchy values.
// - studentId is never sent by this screen; the backend resolves it from
//   the JWT.
// - Bearer token from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Directionality-aware Row/Column/ListView throughout.
// - Back button icon mirrors under RTL.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - LessonListTile chevron mirrors via Directionality.of(context).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/lessons_widgets.dart';

/// Lesson list screen for a single chapter.
///
/// Expects route arguments: `{'chapterId': String, 'chapterTitle': String,
/// 'chapterIndex': int?}`. [chapterId] must be backend-supplied; never
/// constructed from user input.
class LessonListPage extends ConsumerStatefulWidget {
  const LessonListPage({
    required this.chapterId,
    required this.chapterTitle,
    this.chapterIndex,
    super.key,
  });

  /// Backend-supplied chapter UUID from the prior ChapterProgressModel response.
  final String chapterId;

  /// Display title of the parent chapter (for the header).
  final String chapterTitle;

  /// Position of this chapter in the previously-loaded chapter list, used
  /// only to render the "CHAPTER N" eyebrow label. Null when the screen is
  /// reached without that context (e.g. a deep link).
  final int? chapterIndex;

  @override
  ConsumerState<LessonListPage> createState() => _LessonListPageState();
}

class _LessonListPageState extends ConsumerState<LessonListPage> {
  ChapterQuizSummaryModel? _quiz;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load();
      _loadQuiz();
    });
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(lessonsListProvider.notifier).load(
          bearerToken: token,
          chapterId: widget.chapterId,
        );
  }

  Future<void> _loadQuiz() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    final quiz = await ref.read(lessonsRepositoryProvider).getChapterQuiz(
          bearerToken: token,
          chapterId: widget.chapterId,
        );
    if (mounted) setState(() => _quiz = quiz);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(lessonsListProvider.notifier).refresh(
          bearerToken: token,
          chapterId: widget.chapterId,
        );
    await _loadQuiz();
  }

  void _onQuizTap() {
    final quiz = _quiz;
    if (quiz == null) return;
    context.push(
      '/student/assessments/detail',
      extra: {
        'assessmentId': quiz.assessmentId,
        'assessmentTitle': quiz.title,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(lessonsListProvider);
    final lessons = state is AppAsyncSuccess<List<LessonProgressModel>>
        ? state.data
        : const <LessonProgressModel>[];
    final loadingLabel =
        AppLocalizations.of(context).lessonsLoadingLessonsSemantic;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _LessonListHeader(
              chapterTitle: widget.chapterTitle,
              chapterIndex: widget.chapterIndex,
              lessons: lessons,
            ),
            Expanded(
              child: switch (state) {
                AppAsyncLoading() => AIMFullScreenLoading(
                    semanticLabel: loadingLabel,
                  ),
                AppAsyncFailure(:final message) => AIMFullScreenError(
                    message: message,
                    onRetry: _load,
                  ),
                AppAsyncSuccess(:final data) => _LessonListContent(
                    lessons: data,
                    onRefresh: _refresh,
                    quiz: _quiz,
                    onQuizTap: _onQuizTap,
                  ),
                AppAsyncIdle() => AIMFullScreenLoading(
                    semanticLabel: loadingLabel,
                  ),
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Header — back button, "CHAPTER N" eyebrow, title, real progress bar
// ---------------------------------------------------------------------------

class _LessonListHeader extends StatelessWidget {
  const _LessonListHeader({
    required this.chapterTitle,
    required this.chapterIndex,
    required this.lessons,
  });

  final String chapterTitle;
  final int? chapterIndex;
  final List<LessonProgressModel> lessons;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    // Real "N/total done" — backend-computed LessonProgressModel.completed.
    final completedCount = lessons.where((lesson) => lesson.completed).length;

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space12,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              AIMIconButton(
                semanticLabel: l10n.commonBack,
                onPressed: () {
                  if (context.canPop()) context.pop();
                },
                icon: Icon(
                  Directionality.of(context) == TextDirection.rtl
                      ? Icons.chevron_right_rounded
                      : Icons.chevron_left_rounded,
                ),
              ),
              const SizedBox(width: AimSpacing.space4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (chapterIndex != null)
                      Text(
                        l10n.lessonsChapterEyebrowLabel(chapterIndex! + 1),
                        style: AimTextStyles.caption.copyWith(
                          color: AimColors.primary500,
                          fontWeight: AimFontWeights.bold,
                          letterSpacing: 0.6,
                        ),
                      ),
                    Text(
                      chapterTitle,
                      style: AimTextStyles.h3
                          .copyWith(color: surfaces.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (lessons.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.componentGap),
            AIMProgressBar(
              value: completedCount.toDouble(),
              max: lessons.length.toDouble(),
              tone: AIMProgressBarTone.gradient,
              showValue: true,
              valueFormat: (v, m) =>
                  l10n.commonDoneProgress(v.round(), m.round()),
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _LessonListContent extends StatelessWidget {
  const _LessonListContent({
    required this.lessons,
    required this.onRefresh,
    required this.quiz,
    required this.onQuizTap,
  });

  final List<LessonProgressModel> lessons;
  final Future<void> Function() onRefresh;
  final ChapterQuizSummaryModel? quiz;
  final VoidCallback onQuizTap;

  @override
  Widget build(BuildContext context) {
    if (lessons.isEmpty && quiz == null) {
      final l10n = AppLocalizations.of(context);
      return AIMEmptyState(
        icon: const Icon(Icons.play_lesson_outlined),
        title: l10n.lessonsNoLessonsTitle,
        subtitle: l10n.lessonsNoLessonsSubtitle,
      );
    }

    final itemCount = lessons.length + (quiz != null ? 1 : 0);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: itemCount,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          if (index >= lessons.length) {
            return ChapterQuizTile(model: quiz!, onTap: onQuizTap);
          }
          final lesson = lessons[index];
          return LessonListTile(
            model: lesson,
            index: index,
            onTap: () {
              // Navigate to lesson detail; lessonId is backend-supplied.
              context.push(
                AppRoutePaths.lessonDetail,
                extra: {
                  'lessonId': lesson.id,
                  'lessonTitle': lesson.title,
                },
              );
            },
          );
        },
      ),
    );
  }
}
