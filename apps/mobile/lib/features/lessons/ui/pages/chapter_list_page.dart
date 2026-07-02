// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Chapters" (chapterList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/07-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/07-screen.png
// Endpoint: GET /curriculum/chapters?levelId= (ChapterModel fields only)
// Widgets: AIMTopAppBar, AIMFullScreenLoading, AIMFullScreenError,
//   AIMEmptyState, ChapterListTile
//
// Phase 6 — P6-074
// ChapterListPage — displays chapters for a backend-supplied course.
//
// Receives [courseId] and [courseTitle] from route arguments (set by
// CourseListPage). A course's chapters live under its levels, so this page
// first resolves the course's (first) level via [getLevels], then loads
// chapters for that resolved levelId via [chaptersProvider.autoDispose].
// Tapping a chapter navigates to the lesson list (P6-075).
//
// Real-data-only redesign: the design screenshots show a header-level
// percent-done badge ("62% DONE"), a level badge ("A2 level"), filter chips
// ("All chapters"/"In progress"/"Completed"), and per-chapter level
// badges/progress bars/lesson counts/completion chips. None of those have
// a backing field on the backend's ChapterModel (no level, no per-student
// progress, no lesson count, no completion flag — see
// services/backend-api/src/features/curriculum/chapters). Those are
// intentionally omitted here rather than fabricated; see ChapterListTile
// for the row-level real-data-only treatment. What IS real and shown here:
// once the chapter list has loaded, the subtitle displays
// '${chapters.length} chapters' — a string computed from the real,
// already-loaded list length, not fabricated.
//
// Security rules:
// - courseId is always the backend-supplied value from CourseModel; never
//   from user input or local computation. The resolved levelId is always
//   backend-supplied from a prior LevelModel response.
// - chapterId passed to the next screen is always from ChapterModel.
// - Flutter never computes status, sortOrder, or hierarchy values.
// - Bearer token from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Directionality-aware Row/Column/ListView throughout.
// - AIMTopAppBar handles back-arrow mirroring internally.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - ChapterListTile chevron mirrors via Directionality.of(context).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import '../widgets/lessons_widgets.dart';

/// Chapter list screen for a single course.
///
/// Expects route arguments: `{'courseId': String, 'courseTitle': String}`.
/// [courseId] must be backend-supplied; never constructed from user input.
class ChapterListPage extends ConsumerStatefulWidget {
  const ChapterListPage({
    required this.courseId,
    required this.courseTitle,
    super.key,
  });

  /// Backend-supplied course UUID from the prior CourseModel response.
  final String courseId;

  /// Display title of the parent course (for the AppBar).
  final String courseTitle;

  @override
  ConsumerState<ChapterListPage> createState() => _ChapterListPageState();
}

class _ChapterListPageState extends ConsumerState<ChapterListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(chaptersProvider.notifier).loadForCourse(
          bearerToken: token,
          courseId: widget.courseId,
        );
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(chaptersProvider.notifier).loadForCourse(
          bearerToken: token,
          courseId: widget.courseId,
        );
  }

  void _onChapterTap(ChapterModel chapter) {
    // Navigate to lesson list with backend-supplied chapterId.
    // chapterId is never constructed from user input.
    Navigator.of(context).pushNamed(
      AppRoutePaths.chapterLessons,
      arguments: {
        'chapterId': chapter.id,
        'chapterTitle': chapter.title,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chaptersProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.courseTitle),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading chapters',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _ChapterListContent(
            chapters: data,
            onRefresh: _refresh,
            onTap: _onChapterTap,
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading chapters',
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _ChapterListContent extends StatelessWidget {
  const _ChapterListContent({
    required this.chapters,
    required this.onRefresh,
    required this.onTap,
  });

  final List<ChapterModel> chapters;
  final Future<void> Function() onRefresh;
  final void Function(ChapterModel) onTap;

  @override
  Widget build(BuildContext context) {
    if (chapters.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.layers_outlined),
        title: 'No chapters available',
        subtitle: 'Published chapters will appear here.',
      );
    }

    final surfaces = aimSurfacesOf(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        // +1 for the real chapter-count subtitle header row.
        itemCount: chapters.length + 1,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          if (index == 0) {
            // Real, computed-from-real-data subtitle: the chapter count is
            // known once the list has loaded — not fabricated.
            return Text(
              '${chapters.length} chapters',
              style: AimTextStyles.bodySm
                  .copyWith(color: surfaces.textSecondary),
            );
          }
          final chapter = chapters[index - 1];
          return ChapterListTile(
            model: chapter,
            index: index - 1,
            onTap: () => onTap(chapter),
          );
        },
      ),
    );
  }
}
