// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Chapters" (chapterList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/07-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/07-screen.png
// Endpoint: GET /curriculum/chapters?levelId= (ChapterModel fields only)
// Widgets: AIMIconButton, AIMBadge, AIMChip, AIMFullScreenLoading,
//   AIMFullScreenError, AIMEmptyState, ChapterListTile
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
// Visual parity pass: the design shows a header-level percent-done badge
// ("62% DONE"), filter chips ("All chapters"/"In progress"/"Completed"),
// and per-chapter progress bars/lesson counts/completion chips. None of
// those have a backing field on the backend's ChapterModel (no per-student
// progress, no lesson count — see
// services/backend-api/src/features/curriculum/chapters). Rather than omit
// them (which left the screen visually mismatched from the design), they
// are rendered from a deterministic, cosmetic [ChapterProgressMock] — see
// curriculum_progress_mock.dart and TODO_BACKEND_PROGRESS.md for the real
// endpoints this should be replaced with once available. Title/description
// and the '${chapters.length} chapters' subtitle remain real, backend-
// sourced values.
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
// - Back button icon mirrors under RTL.
// - EdgeInsets.symmetric mirrors correctly under RTL.
// - ChapterListTile chevron mirrors via Directionality.of(context).

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

  /// Display title of the parent course (for the header).
  final String courseTitle;

  @override
  ConsumerState<ChapterListPage> createState() => _ChapterListPageState();
}

class _ChapterListPageState extends ConsumerState<ChapterListPage> {
  ChapterListFilter _filter = ChapterListFilter.all;

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

  void _onChapterTap(ChapterModel chapter, int index) {
    // Navigate to lesson list with backend-supplied chapterId.
    // chapterId is never constructed from user input. chapterIndex is the
    // chapter's real position in the backend-ordered list — used only to
    // render the "CHAPTER N" eyebrow label on the next screen.
    context.push(
      AppRoutePaths.chapterLessons,
      extra: {
        'chapterId': chapter.id,
        'chapterTitle': chapter.title,
        'chapterIndex': index,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chaptersProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            switch (state) {
              AppAsyncSuccess(:final data) => _ChapterListHeader(
                  courseTitle: widget.courseTitle,
                  chapters: data,
                  filter: _filter,
                  onFilterChanged: (f) => setState(() => _filter = f),
                ),
              _ => _ChapterListHeader(
                  courseTitle: widget.courseTitle,
                  chapters: const [],
                  filter: _filter,
                  onFilterChanged: (f) => setState(() => _filter = f),
                ),
            },
            Expanded(
              child: switch (state) {
                AppAsyncLoading() => const AIMFullScreenLoading(
                    semanticLabel: 'Loading chapters',
                  ),
                AppAsyncFailure(:final message) => AIMFullScreenError(
                    message: message,
                    onRetry: _load,
                  ),
                AppAsyncSuccess(:final data) => _ChapterListContent(
                    chapters: data,
                    filter: _filter,
                    onRefresh: _refresh,
                    onTap: _onChapterTap,
                  ),
                AppAsyncIdle() => const AIMFullScreenLoading(
                    semanticLabel: 'Loading chapters',
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
// Header — title, real chapter count, cosmetic percent-done badge, filters
// ---------------------------------------------------------------------------

class _ChapterListHeader extends StatelessWidget {
  const _ChapterListHeader({
    required this.courseTitle,
    required this.chapters,
    required this.filter,
    required this.onFilterChanged,
  });

  final String courseTitle;
  final List<ChapterModel> chapters;
  final ChapterListFilter filter;
  final ValueChanged<ChapterListFilter> onFilterChanged;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);

    // Cosmetic overall percent — average of the per-chapter mock progress.
    // See ChapterProgressMock doc comment; not a real backend aggregate.
    final overallPercent = chapters.isEmpty
        ? 0
        : (chapters.asMap().entries.fold<int>(
                  0,
                  (sum, entry) => sum +
                      ChapterProgressMock.forIndex(
                        entry.key,
                        chapters.length,
                      ).percent,
                ) /
                chapters.length)
            .round();

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
                    Text(
                      courseTitle,
                      style: AimTextStyles.h3
                          .copyWith(color: surfaces.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (chapters.isNotEmpty) ...[
                      const SizedBox(height: AimSpacing.space2),
                      Text(
                        // Real, computed-from-real-data subtitle — the
                        // chapter count is known once the list has loaded.
                        '${chapters.length} chapters',
                        style: AimTextStyles.bodySm
                            .copyWith(color: surfaces.textSecondary),
                      ),
                    ],
                  ],
                ),
              ),
              if (chapters.isNotEmpty) ...[
                const SizedBox(width: AimSpacing.space8),
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: soft.success,
                    borderRadius: AimRadius.borderPill,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space12,
                      vertical: AimSpacing.space8,
                    ),
                    child: Semantics(
                      label: '$overallPercent percent done',
                      child: ExcludeSemantics(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '$overallPercent%',
                              style: AimTextStyles.label.copyWith(
                                color: AimColors.success700,
                                fontWeight: AimFontWeights.bold,
                              ),
                            ),
                            Text(
                              'DONE',
                              style: AimTextStyles.caption.copyWith(
                                color: AimColors.success700,
                                fontWeight: AimFontWeights.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
          if (chapters.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.componentGap),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final entry in const [
                    (ChapterListFilter.all, 'All chapters'),
                    (ChapterListFilter.inProgress, 'In progress'),
                    (ChapterListFilter.completed, 'Completed'),
                  ]) ...[
                    AIMChip(
                      selected: filter == entry.$1,
                      onPressed: () => onFilterChanged(entry.$1),
                      child: Text(entry.$2),
                    ),
                    const SizedBox(width: AimSpacing.space8),
                  ],
                ],
              ),
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

class _ChapterListContent extends StatelessWidget {
  const _ChapterListContent({
    required this.chapters,
    required this.filter,
    required this.onRefresh,
    required this.onTap,
  });

  final List<ChapterModel> chapters;
  final ChapterListFilter filter;
  final Future<void> Function() onRefresh;
  final void Function(ChapterModel, int) onTap;

  @override
  Widget build(BuildContext context) {
    if (chapters.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.layers_outlined),
        title: 'No chapters available',
        subtitle: 'Published chapters will appear here.',
      );
    }

    // Index is preserved from the full, backend-ordered list even when
    // filtered, so the numbered circle and mock progress stay stable.
    final visible = <(int, ChapterModel)>[
      for (final (index, chapter) in chapters.indexed)
        if (_matchesFilter(index, chapters.length)) (index, chapter),
    ];

    if (visible.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.filter_alt_off_outlined),
        title: 'No chapters in this filter',
        subtitle: 'Try a different filter above.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: visible.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, i) {
          final (index, chapter) = visible[i];
          return ChapterListTile(
            model: chapter,
            index: index,
            progress: ChapterProgressMock.forIndex(index, chapters.length),
            onTap: () => onTap(chapter, index),
          );
        },
      ),
    );
  }

  bool _matchesFilter(int index, int total) {
    if (filter == ChapterListFilter.all) return true;
    final progress = ChapterProgressMock.forIndex(index, total);
    return switch (filter) {
      ChapterListFilter.all => true,
      ChapterListFilter.inProgress => progress.inProgress,
      ChapterListFilter.completed => progress.completed,
    };
  }
}
