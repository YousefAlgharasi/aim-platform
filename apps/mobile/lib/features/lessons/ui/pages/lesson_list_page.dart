// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lessons" (lessonList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/08-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/08-screen.png
// Endpoint: GET /curriculum/lessons?chapterId=
// Widgets: AIMTopAppBar, AIMFullScreenLoading, AIMFullScreenError,
//   AIMEmptyState, LessonListTile
//
// Phase 6 — P6-075
// LessonListPage — displays lessons for a backend-supplied chapter.
//
// Receives [chapterId] and [chapterTitle] from route arguments (set by
// ChapterListPage). Loads via [lessonsListProvider.autoDispose] on first build.
// Tapping a lesson navigates to [AppRoutePaths.lessonDetail] with the
// backend-supplied lessonId and lessonTitle as route arguments.
//
// Real-data-only redesign: the design screenshots show a chapter-level
// progress bar ("2/4 done") and per-lesson type/duration/completion
// indicators that have no backing field on the backend's LessonModel (see
// services/backend-api/src/features/curriculum/lessons). Those are
// intentionally omitted here rather than fabricated; see LessonListTile
// for the row-level real-data-only treatment. The chapter header/progress
// bar redesign is out of scope for this task — the existing
// AIMTopAppBar(title: chapterTitle) app bar is kept as-is.
//
// Security rules:
// - chapterId is always the backend-supplied value from ChapterModel; never
//   from user input or local computation.
// - Flutter never computes status, sortOrder, or hierarchy values.
// - Bearer token from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Directionality-aware Row/Column/ListView throughout.
// - AIMTopAppBar handles back-arrow mirroring internally.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - LessonListTile chevron mirrors via Directionality.of(context).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import '../widgets/lessons_widgets.dart';

/// Lesson list screen for a single chapter.
///
/// Expects route arguments: `{'chapterId': String, 'chapterTitle': String}`.
/// [chapterId] must be backend-supplied; never constructed from user input.
class LessonListPage extends ConsumerStatefulWidget {
  const LessonListPage({
    required this.chapterId,
    required this.chapterTitle,
    super.key,
  });

  /// Backend-supplied chapter UUID from the prior ChapterModel response.
  final String chapterId;

  /// Display title of the parent chapter (for the AppBar).
  final String chapterTitle;

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

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.chapterTitle),
      body: switch (state) {
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
            onTap: () {
              // Navigate to lesson detail; lessonId is backend-supplied.
              Navigator.of(context).pushNamed(
                AppRoutePaths.lessonDetail,
                arguments: {
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
