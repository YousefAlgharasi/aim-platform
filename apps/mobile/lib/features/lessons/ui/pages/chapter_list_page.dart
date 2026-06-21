// Phase 6 — P6-074
// ChapterListPage — displays chapters for a backend-supplied course level.
//
// Receives [levelId] and [courseTitle] from route arguments (set by
// CourseListPage). Loads via [chaptersProvider.autoDispose] on first build.
// Tapping a chapter navigates to the lesson list (P6-075).
//
// Security rules:
// - levelId is always the backend-supplied value from CourseModel; never
//   from user input or local computation.
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

/// Chapter list screen for a single course level.
///
/// Expects route arguments: `{'levelId': String, 'courseTitle': String}`.
/// [levelId] must be backend-supplied; never constructed from user input.
class ChapterListPage extends ConsumerStatefulWidget {
  const ChapterListPage({
    required this.levelId,
    required this.courseTitle,
    super.key,
  });

  /// Backend-supplied level UUID from the prior CourseModel response.
  final String levelId;

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
    ref.read(chaptersProvider.notifier).load(
          bearerToken: token,
          levelId: widget.levelId,
        );
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(chaptersProvider.notifier).refresh(
          bearerToken: token,
          levelId: widget.levelId,
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
        AppAsyncLoading() => AIMFullScreenLoading(
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
        AppAsyncIdle() => AIMFullScreenLoading(
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
      return AIMEmptyState(
        icon: const Icon(Icons.layers_outlined),
        title: 'No chapters available',
        subtitle: 'Published chapters will appear here.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: chapters.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          final chapter = chapters[index];
          return ChapterListTile(
            model: chapter,
            onTap: () => onTap(chapter),
          );
        },
      ),
    );
  }
}
