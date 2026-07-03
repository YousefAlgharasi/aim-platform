// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lessons" (lessonList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/08-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/08-screen.png
// Endpoint: GET /curriculum/lessons?chapterId=
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
// Visual parity pass: the design shows a chapter-level progress bar
// ("2/4 done") and per-lesson type/duration/completion indicators that
// have no backing field on the backend's LessonModel (see
// services/backend-api/src/features/curriculum/lessons). Rather than omit
// them (which left the screen visually mismatched from the design), they
// are rendered from a deterministic, cosmetic [LessonProgressMock] — see
// curriculum_progress_mock.dart and TODO_BACKEND_PROGRESS.md for the real
// endpoints this should be replaced with once available. Title,
// description, and xpValue remain real, backend-sourced fields.
//
// Security rules:
// - chapterId is always the backend-supplied value from ChapterModel; never
//   from user input or local computation. chapterIndex is only used to
//   render the "CHAPTER N" eyebrow label — it is the chapter's position in
//   the previously-loaded, backend-ordered chapter list.
// - Flutter never computes status, sortOrder, or hierarchy values.
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

  /// Backend-supplied chapter UUID from the prior ChapterModel response.
  final String chapterId;

  /// Display title of the parent chapter (for the header).
  final String chapterTitle;

  /// Position of this chapter in the previously-loaded chapter list, used
  /// only to render the cosmetic "CHAPTER N" eyebrow label. Null when the
  /// screen is reached without that context (e.g. a deep link).
  final int? chapterIndex;

  @override
  ConsumerState<LessonListPage> createState() => _LessonListPageState();
}

class _LessonListPageState extends ConsumerState<LessonListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(lessonsListProvider.notifier).load(
          bearerToken: token,
          chapterId: widget.chapterId,
        );
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(lessonsListProvider.notifier).refresh(
          bearerToken: token,
          chapterId: widget.chapterId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(lessonsListProvider);
    final lessons = state is AppAsyncSuccess<List<LessonModel>>
        ? state.data
        : const <LessonModel>[];

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
                AppAsyncLoading() => const AIMFullScreenLoading(
                    semanticLabel: 'Loading lessons',
                  ),
                AppAsyncFailure(:final message) => AIMFullScreenError(
                    message: message,
                    onRetry: _load,
                  ),
                AppAsyncSuccess(:final data) => _LessonListContent(
                    lessons: data,
                    onRefresh: _refresh,
                  ),
                AppAsyncIdle() => const AIMFullScreenLoading(
                    semanticLabel: 'Loading lessons',
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
// Header — back button, "CHAPTER N" eyebrow, title, cosmetic progress bar
// ---------------------------------------------------------------------------

class _LessonListHeader extends StatelessWidget {
  const _LessonListHeader({
    required this.chapterTitle,
    required this.chapterIndex,
    required this.lessons,
  });

  final String chapterTitle;
  final int? chapterIndex;
  final List<LessonModel> lessons;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    // Cosmetic "N/total done" — see LessonProgressMock doc comment; not a
    // real backend aggregate.
    final completedCount = lessons.isEmpty
        ? 0
        : lessons.indexed
            .where((entry) =>
                LessonProgressMock.forIndex(entry.$1, lessons.length)
                    .completed)
            .length;

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
                semanticLabel: 'Back',
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
                        'CHAPTER ${chapterIndex! + 1}',
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
              valueFormat: (v, m) => '${v.round()}/${m.round()} done',
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
  });

  final List<LessonModel> lessons;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (lessons.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.play_lesson_outlined),
        title: 'No lessons available',
        subtitle: 'Published lessons will appear here.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: lessons.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          final lesson = lessons[index];
          return LessonListTile(
            model: lesson,
            index: index,
            progress: LessonProgressMock.forIndex(index, lessons.length),
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
